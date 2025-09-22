import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const VisorMarkdown = ({ contenido }) => {
    if (!contenido) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">No hay contenido Markdown disponible</p>
            </div>
        );
    }

    return (
        <div className="markdown-body p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8 flex items-center">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-xl font-medium text-gray-700 mb-3 mt-6">
                            {children}
                        </h3>
                    ),
                    p: ({ children }) => (
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-2 text-gray-600">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-600">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="ml-4">
                            {children}
                        </li>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-gray-800">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-gray-700">
                            {children}
                        </em>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primario-500 pl-4 py-2 mb-4 bg-primario-50 text-gray-700 italic">
                            {children}
                        </blockquote>
                    ),
                    code: ({ children, className }) => {
                        const isInline = !className;
                        if (isInline) {
                            return (
                                <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4">
                            {children}
                        </pre>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-4">
                            <table className="min-w-full border border-gray-200 rounded-lg">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-gray-50">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-gray-200">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-gray-50">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">
                            {children}
                        </td>
                    ),
                    hr: () => (
                        <hr className="my-8 border-gray-200" />
                    ),
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            className="text-primario-600 hover:text-primario-700 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    )
                }}
            >
                {contenido}
            </ReactMarkdown>
        </div>
    );
};

export default VisorMarkdown;