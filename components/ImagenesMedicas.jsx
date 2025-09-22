import React, { useState } from 'react';
import { Eye, Image, Stethoscope, XRay, Heart } from 'lucide-react';
import VisorImagenesMedicas from './VisorImagenesMedicas';

const ImagenesMedicas = ({ imagenes = [] }) => {
    const [mostrarVisor, setMostrarVisor] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(0);

    const getIconoTipo = (tipo) => {
        switch (tipo?.toLowerCase()) {
            case 'radiografia':
            case 'radiografía':
                return <XRay className="w-5 h-5" />;
            case 'ecocardiografia':
            case 'ecocardiografía':
                return <Heart className="w-5 h-5" />;
            case 'ecografia':
            case 'ecografía':
                return <Stethoscope className="w-5 h-5" />;
            default:
                return <Image className="w-5 h-5" />;
        }
    };

    const getColorTipo = (tipo) => {
        switch (tipo?.toLowerCase()) {
            case 'radiografia':
            case 'radiografía':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ecocardiografia':
            case 'ecocardiografía':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'ecografia':
            case 'ecografía':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const abrirVisor = (index) => {
        setImagenSeleccionada(index);
        setMostrarVisor(true);
    };

    if (!imagenes || imagenes.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No hay imágenes médicas disponibles</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Image className="w-5 h-5 mr-2" />
                        Imágenes Médicas ({imagenes.length})
                    </h3>
                    <button
                        onClick={() => abrirVisor(0)}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Todas
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {imagenes.map((imagen, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => abrirVisor(index)}
                        >
                            {/* Header de la imagen */}
                            <div className="flex items-center justify-between mb-3">
                                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColorTipo(imagen.tipo)}`}>
                                    {getIconoTipo(imagen.tipo)}
                                    <span className="ml-1 capitalize">{imagen.tipo || 'Imagen'}</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        abrirVisor(index);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Contenido de la imagen */}
                            <div className="space-y-2">
                                <div className="bg-gray-100 rounded-lg p-3 min-h-[120px] flex items-center justify-center">
                                    <div className="text-center">
                                        {getIconoTipo(imagen.tipo)}
                                        <p className="text-sm text-gray-500 mt-1">Imagen {index + 1}</p>
                                    </div>
                                </div>

                                {imagen.descripcion && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-1">Descripción</h4>
                                        <p className="text-sm text-gray-600 line-clamp-2">{imagen.descripcion}</p>
                                    </div>
                                )}

                                {imagen.ubicacion && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-1">Ubicación</h4>
                                        <p className="text-sm text-gray-600">{imagen.ubicacion}</p>
                                    </div>
                                )}

                                {imagen.hallazgos && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-1">Hallazgos</h4>
                                        <p className="text-sm text-gray-600 line-clamp-3">{imagen.hallazgos}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visor de imágenes */}
            <VisorImagenesMedicas
                imagenes={imagenes}
                isOpen={mostrarVisor}
                onClose={() => setMostrarVisor(false)}
                imagenInicial={imagenSeleccionada}
            />
        </>
    );
};

export default ImagenesMedicas;
