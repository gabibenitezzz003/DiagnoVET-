import React, { useState, useRef, useEffect } from 'react';
import {
    ZoomIn,
    ZoomOut,
    RotateCw,
    RotateCcw,
    Download,
    Maximize2,
    Minimize2,
    ChevronLeft,
    ChevronRight,
    X,
    Eye,
    Info
} from 'lucide-react';

const VisorImagenesMedicas = ({ imagenes = [], isOpen, onClose }) => {
    const [imagenActual, setImagenActual] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [rotacion, setRotacion] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mostrarInfo, setMostrarInfo] = useState(false);
    const canvasRef = useRef(null);
    const imagenRef = useRef(null);

    // Efectos para manejar el canvas
    useEffect(() => {
        if (imagenRef.current && canvasRef.current) {
            dibujarImagen();
        }
    }, [zoom, rotacion, imagenActual]);

    const dibujarImagen = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = imagenRef.current;

        if (!img || !canvas) return;

        canvas.width = img.naturalWidth * zoom;
        canvas.height = img.naturalHeight * zoom;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotacion * Math.PI) / 180);
        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        ctx.restore();
    };

    const cambiarImagen = (direccion) => {
        const nuevaImagen = direccion === 'siguiente'
            ? (imagenActual + 1) % imagenes.length
            : (imagenActual - 1 + imagenes.length) % imagenes.length;
        setImagenActual(nuevaImagen);
        setZoom(1);
        setRotacion(0);
    };

    const ajustarZoom = (factor) => {
        setZoom(prev => Math.max(0.1, Math.min(5, prev * factor)));
    };

    const rotarImagen = (direccion) => {
        setRotacion(prev => prev + (direccion === 'derecha' ? 90 : -90));
    };

    const resetearVista = () => {
        setZoom(1);
        setRotacion(0);
    };

    const descargarImagen = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = `imagen_medica_${imagenActual + 1}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    if (!isOpen || imagenes.length === 0) return null;

    const imagen = imagenes[imagenActual];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-gray-900 bg-opacity-95 p-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <h3 className="text-white text-lg font-semibold">
                        Visor de Imágenes Médicas
                    </h3>
                    <span className="text-gray-300">
                        {imagenActual + 1} de {imagenes.length}
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setMostrarInfo(!mostrarInfo)}
                        className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Información de la imagen"
                    >
                        <Info size={20} />
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Cerrar visor"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Controles laterales */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
                <button
                    onClick={() => cambiarImagen('anterior')}
                    disabled={imagenes.length <= 1}
                    className="p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Imagen anterior"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={() => cambiarImagen('siguiente')}
                    disabled={imagenes.length <= 1}
                    className="p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Imagen siguiente"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Área de imagen */}
            <div className="flex-1 flex items-center justify-center p-4 mt-16">
                <div className="relative max-w-full max-h-full">
                    <canvas
                        ref={canvasRef}
                        className="max-w-full max-h-full border border-gray-600 rounded-lg shadow-2xl"
                        style={{ cursor: 'grab' }}
                    />
                    <img
                        ref={imagenRef}
                        src={imagen?.url || '/placeholder-imagen-medica.jpg'}
                        alt={imagen?.descripcion || 'Imagen médica'}
                        className="hidden"
                        onLoad={dibujarImagen}
                    />
                </div>
            </div>

            {/* Controles inferiores */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-95 p-4">
                <div className="flex justify-center items-center space-x-4">
                    {/* Zoom */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => ajustarZoom(0.8)}
                            className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="Alejar"
                        >
                            <ZoomOut size={20} />
                        </button>
                        <span className="text-white text-sm min-w-[60px] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={() => ajustarZoom(1.25)}
                            className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="Acercar"
                        >
                            <ZoomIn size={20} />
                        </button>
                    </div>

                    {/* Rotación */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => rotarImagen('izquierda')}
                            className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="Rotar izquierda"
                        >
                            <RotateCcw size={20} />
                        </button>
                        <button
                            onClick={() => rotarImagen('derecha')}
                            className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="Rotar derecha"
                        >
                            <RotateCw size={20} />
                        </button>
                    </div>

                    {/* Reset */}
                    <button
                        onClick={resetearVista}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Resetear vista"
                    >
                        Reset
                    </button>

                    {/* Descargar */}
                    <button
                        onClick={descargarImagen}
                        className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Descargar imagen"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Panel de información */}
            {mostrarInfo && (
                <div className="absolute top-16 right-4 bg-gray-900 bg-opacity-95 p-4 rounded-lg max-w-sm">
                    <h4 className="text-white font-semibold mb-2">Información de la Imagen</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                        <div>
                            <span className="font-medium">Tipo:</span> {imagen?.tipo || 'N/A'}
                        </div>
                        <div>
                            <span className="font-medium">Descripción:</span> {imagen?.descripcion || 'N/A'}
                        </div>
                        <div>
                            <span className="font-medium">Hallazgos:</span> {imagen?.hallazgos || 'N/A'}
                        </div>
                        <div>
                            <span className="font-medium">Ubicación:</span> {imagen?.ubicacion || 'N/A'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisorImagenesMedicas;
