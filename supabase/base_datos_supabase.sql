-- =====================================================
-- DIAGNOVET - BASE DE DATOS COMPLETA Y OPTIMIZADA
-- Sistema de Reportes Veterinarios con IA
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla de veterinarios
CREATE TABLE veterinarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    especializacion VARCHAR(100) DEFAULT 'Medicina General',
    clinica VARCHAR(200),
    telefono VARCHAR(50),
    direccion TEXT,
    horario VARCHAR(200),
    foto_url VARCHAR(500),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pacientes
CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(200) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raza VARCHAR(100),
    edad VARCHAR(50),
    sexo VARCHAR(20) CHECK (sexo IN ('macho', 'hembra', 'desconocido')),
    peso DECIMAL(5,2),
    identificacion VARCHAR(100),
    tutor_nombre VARCHAR(200),
    tutor_telefono VARCHAR(50),
    tutor_email VARCHAR(200),
    tutor_direccion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reportes veterinarios
CREATE TABLE reportes_veterinarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    veterinario_id UUID REFERENCES veterinarios(id) ON DELETE SET NULL,
    tipo_estudio VARCHAR(50) NOT NULL CHECK (tipo_estudio IN ('radiografia', 'ecografia', 'ecocardiografia', 'analisis', 'consulta', 'otro')),
    fecha_estudio DATE NOT NULL,
    archivo_original VARCHAR(500) NOT NULL,
    contenido_extraido TEXT,
    confianza_extraccion DECIMAL(3,2) DEFAULT 0.0,
    estado VARCHAR(20) DEFAULT 'completado' CHECK (estado IN ('procesando', 'completado', 'error')),
    tipo_procesamiento VARCHAR(20) DEFAULT 'local' CHECK (tipo_procesamiento IN ('local', 'gemini', 'openai')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de diagnósticos
CREATE TABLE diagnosticos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporte_id UUID REFERENCES reportes_veterinarios(id) ON DELETE CASCADE,
    principal TEXT NOT NULL,
    secundarios TEXT[],
    recomendaciones TEXT[],
    observaciones TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de imágenes médicas
CREATE TABLE imagenes_medicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporte_id UUID REFERENCES reportes_veterinarios(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    url VARCHAR(500) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('radiografia', 'ecografia', 'ecocardiografia', 'analisis', 'otro')),
    pagina INTEGER DEFAULT 1,
    ancho INTEGER,
    alto INTEGER,
    metadatos JSONB,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de hallazgos clínicos
CREATE TABLE hallazgos_clinicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporte_id UUID REFERENCES reportes_veterinarios(id) ON DELETE CASCADE,
    organo VARCHAR(100),
    descripcion TEXT NOT NULL,
    severidad VARCHAR(20) CHECK (severidad IN ('leve', 'moderado', 'severo')),
    tipo VARCHAR(20) CHECK (tipo IN ('normal', 'anormal', 'patologico')),
    mediciones JSONB,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLAS DE SISTEMA
-- =====================================================

-- Tabla de turnos
CREATE TABLE turnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporte_id UUID REFERENCES reportes_veterinarios(id) ON DELETE SET NULL,
    veterinario_id UUID REFERENCES veterinarios(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    duracion_minutos INTEGER DEFAULT 30,
    urgencia VARCHAR(20) DEFAULT 'medio' CHECK (urgencia IN ('bajo', 'medio', 'alto')),
    lugar VARCHAR(200),
    tipo_consulta VARCHAR(50) DEFAULT 'presencial' CHECK (tipo_consulta IN ('presencial', 'virtual', 'domicilio')),
    mensaje TEXT,
    estado VARCHAR(20) DEFAULT 'programado' CHECK (estado IN ('programado', 'confirmado', 'en_progreso', 'completado', 'cancelado')),
    confirmado BOOLEAN DEFAULT false,
    recordatorio_enviado BOOLEAN DEFAULT false,
    notas_internas TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones de chat
CREATE TABLE sesiones_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
    veterinario_id UUID REFERENCES veterinarios(id) ON DELETE SET NULL,
    tipo_sesion VARCHAR(50) DEFAULT 'general' CHECK (tipo_sesion IN ('general', 'consulta', 'seguimiento')),
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'pausada', 'finalizada')),
    metadata JSONB DEFAULT '{}',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes de chat
CREATE TABLE mensajes_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sesion_id UUID REFERENCES sesiones_chat(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    contenido TEXT NOT NULL,
    tipo_mensaje VARCHAR(50) DEFAULT 'texto' CHECK (tipo_mensaje IN ('texto', 'imagen', 'archivo', 'diagnostico')),
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de integraciones n8n
CREATE TABLE integraciones_n8n (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    webhook_url VARCHAR(500) NOT NULL,
    tipo_integracion VARCHAR(50) NOT NULL CHECK (tipo_integracion IN ('turnos', 'reportes', 'chat', 'notificaciones')),
    activa BOOLEAN DEFAULT true,
    configuracion JSONB DEFAULT '{}',
    ultima_sincronizacion TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de eventos n8n
CREATE TABLE eventos_n8n (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integracion_id UUID REFERENCES integraciones_n8n(id) ON DELETE CASCADE,
    tipo_evento VARCHAR(100) NOT NULL,
    datos_evento JSONB NOT NULL,
    estado_procesamiento VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_procesamiento IN ('pendiente', 'procesando', 'completado', 'error')),
    intentos INTEGER DEFAULT 0,
    error_mensaje TEXT,
    procesado_en TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('email', 'sms', 'push', 'webhook')),
    destinatario VARCHAR(200) NOT NULL,
    asunto VARCHAR(200),
    contenido TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviada', 'fallida')),
    intentos INTEGER DEFAULT 0,
    error_mensaje TEXT,
    metadata JSONB DEFAULT '{}',
    enviada_en TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuraciones del sistema
CREATE TABLE configuraciones_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(20) DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
    descripcion TEXT,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices básicos
CREATE INDEX idx_veterinarios_email ON veterinarios(email);
CREATE INDEX idx_veterinarios_matricula ON veterinarios(matricula);
CREATE INDEX idx_veterinarios_activo ON veterinarios(activo);

CREATE INDEX idx_pacientes_nombre ON pacientes(nombre);
CREATE INDEX idx_pacientes_especie ON pacientes(especie);
CREATE INDEX idx_pacientes_tutor_email ON pacientes(tutor_email);

CREATE INDEX idx_reportes_paciente_id ON reportes_veterinarios(paciente_id);
CREATE INDEX idx_reportes_veterinario_id ON reportes_veterinarios(veterinario_id);
CREATE INDEX idx_reportes_tipo_estudio ON reportes_veterinarios(tipo_estudio);
CREATE INDEX idx_reportes_fecha_estudio ON reportes_veterinarios(fecha_estudio);
CREATE INDEX idx_reportes_estado ON reportes_veterinarios(estado);
CREATE INDEX idx_reportes_creado_en ON reportes_veterinarios(creado_en);

CREATE INDEX idx_diagnosticos_reporte_id ON diagnosticos(reporte_id);
CREATE INDEX idx_imagenes_reporte_id ON imagenes_medicas(reporte_id);
CREATE INDEX idx_imagenes_tipo ON imagenes_medicas(tipo);
CREATE INDEX idx_hallazgos_reporte_id ON hallazgos_clinicos(reporte_id);

CREATE INDEX idx_turnos_veterinario_id ON turnos(veterinario_id);
CREATE INDEX idx_turnos_paciente_id ON turnos(paciente_id);
CREATE INDEX idx_turnos_fecha_hora ON turnos(fecha_hora);
CREATE INDEX idx_turnos_estado ON turnos(estado);
CREATE INDEX idx_turnos_urgencia ON turnos(urgencia);

CREATE INDEX idx_sesiones_session_id ON sesiones_chat(session_id);
CREATE INDEX idx_sesiones_paciente_id ON sesiones_chat(paciente_id);
CREATE INDEX idx_mensajes_sesion_id ON mensajes_chat(sesion_id);
CREATE INDEX idx_mensajes_timestamp ON mensajes_chat(timestamp);

-- Índices para búsqueda de texto completo
CREATE INDEX idx_reportes_contenido_fts ON reportes_veterinarios USING gin(to_tsvector('spanish', contenido_extraido));
CREATE INDEX idx_diagnosticos_principal_fts ON diagnosticos USING gin(to_tsvector('spanish', principal));
CREATE INDEX idx_hallazgos_descripcion_fts ON hallazgos_clinicos USING gin(to_tsvector('spanish', descripcion));

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE veterinarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_veterinarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagenes_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE hallazgos_clinicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE integraciones_n8n ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_n8n ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir todas las operaciones (ajustar según necesidades de seguridad)
CREATE POLICY "Allow all operations on veterinarios" ON veterinarios FOR ALL USING (true);
CREATE POLICY "Allow all operations on pacientes" ON pacientes FOR ALL USING (true);
CREATE POLICY "Allow all operations on reportes_veterinarios" ON reportes_veterinarios FOR ALL USING (true);
CREATE POLICY "Allow all operations on diagnosticos" ON diagnosticos FOR ALL USING (true);
CREATE POLICY "Allow all operations on imagenes_medicas" ON imagenes_medicas FOR ALL USING (true);
CREATE POLICY "Allow all operations on hallazgos_clinicos" ON hallazgos_clinicos FOR ALL USING (true);
CREATE POLICY "Allow all operations on turnos" ON turnos FOR ALL USING (true);
CREATE POLICY "Allow all operations on sesiones_chat" ON sesiones_chat FOR ALL USING (true);
CREATE POLICY "Allow all operations on mensajes_chat" ON mensajes_chat FOR ALL USING (true);
CREATE POLICY "Allow all operations on integraciones_n8n" ON integraciones_n8n FOR ALL USING (true);
CREATE POLICY "Allow all operations on eventos_n8n" ON eventos_n8n FOR ALL USING (true);
CREATE POLICY "Allow all operations on notificaciones" ON notificaciones FOR ALL USING (true);
CREATE POLICY "Allow all operations on configuraciones_sistema" ON configuraciones_sistema FOR ALL USING (true);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_veterinarios_updated_at 
    BEFORE UPDATE ON veterinarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at 
    BEFORE UPDATE ON pacientes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reportes_updated_at 
    BEFORE UPDATE ON reportes_veterinarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_turnos_updated_at 
    BEFORE UPDATE ON turnos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sesiones_updated_at 
    BEFORE UPDATE ON sesiones_chat 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integraciones_updated_at 
    BEFORE UPDATE ON integraciones_n8n 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Veterinarios de prueba
INSERT INTO veterinarios (nombre, apellido, email, matricula, especializacion, clinica, telefono, direccion, horario, foto_url) VALUES
('Marina', 'García', 'marina.garcia@diagnovet.ai', 'MP-10001', 'Medicina Interna', 'VetCenter Córdoba', '+54 9 351 555 0001', 'Av. Colón 1234, Córdoba', 'Lun-Vie 9-18h', 'https://i.pravatar.cc/150?img=12'),
('Lucía', 'Rodríguez', 'lucia.rodriguez@diagnovet.ai', 'MP-10002', 'Cirugía', 'VetCenter Córdoba', '+54 9 351 555 0002', 'Av. Colón 1234, Córdoba', 'Lun-Vie 9-18h', 'https://i.pravatar.cc/150?img=14'),
('Agustina', 'Fernández', 'agustina.fernandez@diagnovet.ai', 'MP-10003', 'Dermatología', 'VetCenter Córdoba', '+54 9 351 555 0003', 'Av. Colón 1234, Córdoba', 'Lun-Vie 9-18h', 'https://i.pravatar.cc/150?img=16'),
('Sofía', 'Gómez', 'sofia.gomez@diagnovet.ai', 'MP-10004', 'Cardiología', 'PetCare Córdoba', '+54 9 351 555 0004', 'Av. Colón 1234, Córdoba', 'Lun-Vie 9-18h', 'https://i.pravatar.cc/150?img=18'),
('Camila', 'Torres', 'camila.torres@diagnovet.ai', 'MP-10005', 'Neurología', 'PetCare Córdoba', '+54 9 351 555 0005', 'Av. Colón 1234, Córdoba', 'Lun-Vie 9-18h', 'https://i.pravatar.cc/150?img=20'),
('Julián', 'Pérez', 'julian.perez@diagnovet.ai', 'MP-10011', 'Oftalmología', 'VetCenter Córdoba', '+54 9 351 555 0011', 'Av. Colón 1234, Córdoba', 'Lun-Vie 9-18h', 'https://i.pravatar.cc/150?img=40'),
('Martín', 'Vittaz', 'martin.vittaz@diagnovet.ai', 'MP-10012', 'Traumatología', 'VetCenter Córdoba', '+54 9 351 555 0012', 'Av. Colón 1234, Córdoba', 'Lun-Vie 9-18h', 'https://i.pravatar.cc/150?img=42'),
('Diego', 'López', 'diego.lopez@diagnovet.ai', 'MP-10013', 'Oncología', 'PetCare Córdoba', '+54 9 351 555 0013', 'Av. Colón 1234, Córdoba', 'Lun-Vie 9-18h', 'https://i.pravatar.cc/150?img=44'),
('Pablo', 'Sánchez', 'pablo.sanchez@diagnovet.ai', 'MP-10014', 'Endocrinología', 'VetCenter Córdoba', '+54 9 351 555 0014', 'Av. Colón 1234, Córdoba', 'Lun-Vie 9-18h', 'https://i.pravatar.cc/150?img=46'),
('Nicolás', 'Ruiz', 'nicolas.ruiz@diagnovet.ai', 'MP-10015', 'Medicina General', 'PetCare Córdoba', '+54 9 351 555 0015', 'Av. Colón 1234, Córdoba', 'Lun-Vie 9-18h', 'https://i.pravatar.cc/150?img=48');

-- Configuraciones del sistema
INSERT INTO configuraciones_sistema (clave, valor, tipo, descripcion) VALUES
('n8n_webhook_turnos', 'https://diagnovet.app.n8n.cloud/webhook/455bdd92-93c5-4d1e-942d-f1bee10003d8/turnos', 'string', 'URL del webhook de n8n para turnos'),
('n8n_webhook_chat', 'https://diagnovet.app.n8n.cloud/webhook/455bdd92-93c5-4d1e-942d-f1bee10003d8/chat', 'string', 'URL del webhook de n8n para chat'),
('n8n_webhook_reportes', 'https://diagnovet.app.n8n.cloud/webhook/455bdd92-93c5-4d1e-942d-f1bee10003d8/reportes', 'string', 'URL del webhook de n8n para reportes'),
('turno_duracion_default', '30', 'number', 'Duración por defecto de los turnos en minutos'),
('turno_anticipacion_recordatorio', '24', 'number', 'Horas de anticipación para enviar recordatorios'),
('llm_modo_default', 'local', 'string', 'Modo de procesamiento LLM por defecto'),
('google_drive_folder_id', '1NxLCCGCXbd3H2kNjwfyMirhGDIoanlFJ', 'string', 'ID de la carpeta de Google Drive para reportes'),
('smtp_host', 'smtp.gmail.com', 'string', 'Servidor SMTP para envío de emails'),
('smtp_port', '587', 'number', 'Puerto SMTP para envío de emails'),
('max_file_size_mb', '10', 'number', 'Tamaño máximo de archivo en MB'),
('allowed_file_types', '["application/pdf", "image/jpeg", "image/png"]', 'json', 'Tipos de archivo permitidos'),
('ai_confidence_threshold', '0.7', 'number', 'Umbral mínimo de confianza para IA');

-- Integraciones n8n
INSERT INTO integraciones_n8n (nombre, webhook_url, tipo_integracion, configuracion) VALUES
('Turnos n8n', 'https://diagnovet.app.n8n.cloud/webhook/455bdd92-93c5-4d1e-942d-f1bee10003d8/turnos', 'turnos', '{"eventos": ["crear", "modificar", "cancelar"], "timeout": 30}'),
('Chat n8n', 'https://diagnovet.app.n8n.cloud/webhook/455bdd92-93c5-4d1e-942d-f1bee10003d8/chat', 'chat', '{"eventos": ["mensaje", "sesion"], "timeout": 30}'),
('Reportes n8n', 'https://diagnovet.app.n8n.cloud/webhook/455bdd92-93c5-4d1e-942d-f1bee10003d8/reportes', 'reportes', '{"eventos": ["procesar", "completar"], "timeout": 30}');

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de reportes completos con información relacionada
CREATE VIEW vista_reportes_completos AS
SELECT 
    r.id,
    r.tipo_estudio,
    r.fecha_estudio,
    r.archivo_original,
    r.contenido_extraido,
    r.confianza_extraccion,
    r.estado,
    r.tipo_procesamiento,
    r.creado_en,
    r.actualizado_en,
    p.nombre as paciente_nombre,
    p.especie as paciente_especie,
    p.raza as paciente_raza,
    p.edad as paciente_edad,
    p.sexo as paciente_sexo,
    p.tutor_nombre,
    p.tutor_telefono,
    p.tutor_email,
    v.nombre as veterinario_nombre,
    v.apellido as veterinario_apellido,
    v.matricula as veterinario_matricula,
    v.especializacion as veterinario_especializacion,
    v.clinica as veterinario_clinica,
    d.principal as diagnostico_principal,
    d.secundarios as diagnostico_secundarios,
    d.recomendaciones as diagnostico_recomendaciones
FROM reportes_veterinarios r
LEFT JOIN pacientes p ON r.paciente_id = p.id
LEFT JOIN veterinarios v ON r.veterinario_id = v.id
LEFT JOIN diagnosticos d ON r.id = d.reporte_id;

-- Vista de estadísticas del sistema
CREATE VIEW vista_estadisticas_sistema AS
SELECT 
    (SELECT COUNT(*) FROM reportes_veterinarios) as total_reportes,
    (SELECT COUNT(*) FROM reportes_veterinarios WHERE estado = 'completado') as reportes_completados,
    (SELECT COUNT(*) FROM reportes_veterinarios WHERE estado = 'procesando') as reportes_procesando,
    (SELECT COUNT(*) FROM reportes_veterinarios WHERE estado = 'error') as reportes_error,
    (SELECT COUNT(*) FROM pacientes) as total_pacientes,
    (SELECT COUNT(*) FROM veterinarios WHERE activo = true) as veterinarios_activos,
    (SELECT COUNT(*) FROM turnos WHERE estado = 'programado') as turnos_pendientes,
    (SELECT COUNT(*) FROM imagenes_medicas) as total_imagenes,
    (SELECT AVG(confianza_extraccion) FROM reportes_veterinarios WHERE confianza_extraccion > 0) as confianza_promedio;

-- =====================================================
-- FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para obtener estadísticas de un veterinario
CREATE OR REPLACE FUNCTION obtener_estadisticas_veterinario(vet_id UUID)
RETURNS JSON AS $$
DECLARE
    resultado JSON;
BEGIN
    SELECT json_build_object(
        'total_reportes', COUNT(*),
        'reportes_completados', COUNT(*) FILTER (WHERE estado = 'completado'),
        'reportes_procesando', COUNT(*) FILTER (WHERE estado = 'procesando'),
        'confianza_promedio', AVG(confianza_extraccion),
        'tipos_estudio', json_agg(DISTINCT tipo_estudio),
        'fecha_ultimo_reporte', MAX(creado_en)
    ) INTO resultado
    FROM reportes_veterinarios 
    WHERE veterinario_id = vet_id;
    
    RETURN COALESCE(resultado, '{}'::json);
END;
$$ LANGUAGE plpgsql;

-- Función para buscar reportes por texto
CREATE OR REPLACE FUNCTION buscar_reportes_por_texto(termino_busqueda TEXT, limite_busqueda INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    paciente_nombre VARCHAR,
    veterinario_nombre VARCHAR,
    tipo_estudio VARCHAR,
    diagnostico_principal TEXT,
    confianza_extraccion DECIMAL,
    fecha_estudio DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        p.nombre,
        CONCAT(v.nombre, ' ', v.apellido),
        r.tipo_estudio,
        d.principal,
        r.confianza_extraccion,
        r.fecha_estudio
    FROM reportes_veterinarios r
    LEFT JOIN pacientes p ON r.paciente_id = p.id
    LEFT JOIN veterinarios v ON r.veterinario_id = v.id
    LEFT JOIN diagnosticos d ON r.id = d.reporte_id
    WHERE 
        to_tsvector('spanish', r.contenido_extraido) @@ plainto_tsquery('spanish', termino_busqueda)
        OR to_tsvector('spanish', d.principal) @@ plainto_tsquery('spanish', termino_busqueda)
        OR p.nombre ILIKE '%' || termino_busqueda || '%'
        OR CONCAT(v.nombre, ' ', v.apellido) ILIKE '%' || termino_busqueda || '%'
    ORDER BY r.creado_en DESC
    LIMIT limite_busqueda;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

COMMENT ON DATABASE postgres IS 'Base de datos completa para DiagnoVET - Sistema de Reportes Veterinarios con IA';
COMMENT ON TABLE veterinarios IS 'Información de veterinarios del sistema';
COMMENT ON TABLE pacientes IS 'Información de pacientes animales';
COMMENT ON TABLE reportes_veterinarios IS 'Reportes médicos veterinarios procesados';
COMMENT ON TABLE diagnosticos IS 'Diagnósticos asociados a los reportes';
COMMENT ON TABLE imagenes_medicas IS 'Imágenes médicas extraídas de los reportes';
COMMENT ON TABLE hallazgos_clinicos IS 'Hallazgos clínicos específicos de cada reporte';
COMMENT ON TABLE turnos IS 'Sistema de turnos y citas';
COMMENT ON TABLE sesiones_chat IS 'Sesiones del chatbot médico';
COMMENT ON TABLE mensajes_chat IS 'Mensajes del chatbot médico';
COMMENT ON TABLE integraciones_n8n IS 'Configuración de integraciones con n8n';
COMMENT ON TABLE eventos_n8n IS 'Eventos procesados por n8n';
COMMENT ON TABLE notificaciones IS 'Sistema de notificaciones';
COMMENT ON TABLE configuraciones_sistema IS 'Configuraciones generales del sistema';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
