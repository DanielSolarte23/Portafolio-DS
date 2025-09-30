const express = require('express');
const { engine } = require('express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv')
const app = express();
const PORT = process.env.PORT || 3000;


dotenv.config();
// ===================================
// Configuración de Seguridad
// ===================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:']
    }
  }
}));

// ===================================
// Rate Limiting
// ===================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por IP
  message: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde.'
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 envíos de formulario por hora
  message: 'Has enviado demasiados mensajes. Por favor, intenta más tarde.'
});

app.use('/api/', limiter);
app.use('/contact', contactLimiter);

// ===================================
// Middlewares
// ===================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ===================================
// Configuración de Handlebars
// ===================================
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: false,
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials')
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// ===================================
// Configuración de Nodemailer
// ===================================
// IMPORTANTE: Configurar con credenciales reales
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'tu-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'tu-contraseña-de-app'
  }
});

// Verificar conexión de email
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error en configuración de email:', error);
  } else {
    console.log('✅ Servidor de email listo');
  }
});

// ===================================
// Funciones de Validación
// ===================================
const validators = {
  name: (value) => {
    if (!value || typeof value !== 'string') return 'El nombre es requerido';
    const trimmed = value.trim();
    if (trimmed.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (trimmed.length > 100) return 'El nombre es demasiado largo';
    if (!/^[a-záéíóúñü\s]+$/i.test(trimmed)) return 'El nombre contiene caracteres inválidos';
    return null;
  },
  
  email: (value) => {
    if (!value || typeof value !== 'string') return 'El email es requerido';
    const trimmed = value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return 'Email inválido';
    if (trimmed.length > 254) return 'Email demasiado largo';
    return null;
  },
  
  subject: (value) => {
    if (!value || typeof value !== 'string') return 'El asunto es requerido';
    const trimmed = value.trim();
    if (trimmed.length < 3) return 'El asunto debe tener al menos 3 caracteres';
    if (trimmed.length > 200) return 'El asunto es demasiado largo';
    return null;
  },
  
  message: (value) => {
    if (!value || typeof value !== 'string') return 'El mensaje es requerido';
    const trimmed = value.trim();
    if (trimmed.length < 10) return 'El mensaje debe tener al menos 10 caracteres';
    if (trimmed.length > 5000) return 'El mensaje es demasiado largo';
    return null;
  }
};

function validateContactForm(data) {
  const errors = {};
  
  Object.keys(validators).forEach(field => {
    const error = validators[field](data[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// ===================================
// Sanitización de datos
// ===================================
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Eliminar < y >
    .substring(0, 5000); // Limitar longitud
}

// ===================================
// Rutas
// ===================================

// Ruta principal
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Alex Rivera - Full-Stack Developer'
  });
});

// Ruta para procesar formulario de contacto
app.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validar datos
    const validation = validateContactForm({ name, email, subject, message });
    
    if (!validation.isValid) {
      return res.render('index', {
        title: 'Alex Rivera - Full-Stack Developer',
        error: 'Por favor, corrige los errores en el formulario',
        formData: { name, email, subject, message },
        errors: validation.errors
      });
    }
    
    // Sanitizar datos
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      subject: sanitizeInput(subject),
      message: sanitizeInput(message)
    };
    
    // Configurar email al propietario del portafolio
    const mailToOwner = {
      from: `"Portafolio Contacto" <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL || 'alex.rivera@email.com',
      replyTo: sanitizedData.email,
      subject: `Nuevo mensaje de portafolio: ${sanitizedData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #0a0a0a; color: #ffd700; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Nuevo Mensaje de Contacto</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 5px 5px;">
            <div style="margin-bottom: 20px;">
              <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase;">Nombre:</p>
              <p style="margin: 5px 0 0 0; color: #333; font-size: 16px; font-weight: bold;">${sanitizedData.name}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase;">Email:</p>
              <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">
                <a href="mailto:${sanitizedData.email}" style="color: #ffd700; text-decoration: none;">${sanitizedData.email}</a>
              </p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase;">Asunto:</p>
              <p style="margin: 5px 0 0 0; color: #333; font-size: 16px; font-weight: bold;">${sanitizedData.subject}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase;">Mensaje:</p>
              <div style="margin: 10px 0 0 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ffd700; border-radius: 3px;">
                <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${sanitizedData.message}</p>
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 0; color: #999; font-size: 13px;">
                Este mensaje fue enviado desde tu portafolio web
              </p>
              <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">
                Fecha: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    // Email de confirmación al remitente
    const mailToSender = {
      from: `"Alex Rivera" <${process.env.EMAIL_USER}>`,
      to: sanitizedData.email,
      subject: 'Gracias por tu mensaje - Alex Rivera',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #0a0a0a; color: #ffd700; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">¡Gracias por contactarme!</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 5px 5px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hola <strong>${sanitizedData.name}</strong>,
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              He recibido tu mensaje y me pondré en contacto contigo lo antes posible. 
              Normalmente respondo en un plazo de 24-48 horas.
            </p>
            
            <div style="margin: 25px 0; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #ffd700; border-radius: 3px;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase;">Tu mensaje:</p>
              <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${sanitizedData.message}</p>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Mientras tanto, puedes revisar mis proyectos en mi 
              <a href="https://github.com" style="color: #ffd700; text-decoration: none; font-weight: bold;">GitHub</a> 
              o conectar conmigo en 
              <a href="https://linkedin.com" style="color: #ffd700; text-decoration: none; font-weight: bold;">LinkedIn</a>.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #333; font-size: 15px;">
                Saludos,<br>
                <strong style="color: #ffd700;">Alex Rivera</strong><br>
                <span style="color: #666; font-size: 14px;">Full-Stack Developer</span>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2025 Alex Rivera. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    };
    
    // Enviar ambos emails
    await transporter.sendMail(mailToOwner);
    await transporter.sendMail(mailToSender);
    
    // Responder con éxito
    return res.render('index', {
      title: 'Alex Rivera - Full-Stack Developer',
      success: '¡Mensaje enviado correctamente! Te responderé pronto.'
    });
    
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    
    return res.render('index', {
      title: 'Alex Rivera - Full-Stack Developer',
      error: 'Hubo un error al enviar el mensaje. Por favor, intenta nuevamente o contáctame directamente por email.',
      formData: req.body
    });
  }
});

// Ruta 404
app.use((req, res) => {
  res.status(404).render('index', {
    title: '404 - Página no encontrada',
    error: 'La página que buscas no existe'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).render('index', {
    title: 'Error del servidor',
    error: 'Ha ocurrido un error en el servidor. Por favor, intenta más tarde.'
  });
});

// ===================================
// Iniciar servidor
// ===================================
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🚀 PORTAFOLIO SERVIDOR ACTIVO 🚀    ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║   URL: http://localhost:${PORT}         ║`);
  console.log(`║   Entorno: ${process.env.NODE_ENV || 'development'}              ║`);
  console.log('╚════════════════════════════════════════╝');
});