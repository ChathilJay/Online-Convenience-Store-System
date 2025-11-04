import React, { useState, useEffect } from 'react';
import { Code, X, ChevronDown, ChevronUp, Terminal, Trash2, Maximize2, Minimize2 } from 'lucide-react';

const DevTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [apiLogs, setApiLogs] = useState([]);
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    // Check if dev mode is enabled in localStorage
    const devMode = localStorage.getItem('devMode') === 'true';
    setIsOpen(devMode);

    // Listen for API logs from window events
    const handleApiLog = (event) => {
      setApiLogs((prev) => [event.detail, ...prev].slice(0, 50)); // Keep last 50 logs
    };

    window.addEventListener('apiLog', handleApiLog);
    return () => window.removeEventListener('apiLog', handleApiLog);
  }, []);

  const toggleDevMode = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('devMode', newState.toString());
    if (!newState) {
      setApiLogs([]); // Clear logs when closing
    }
  };

  const clearLogs = () => {
    setApiLogs([]);
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-emerald-700 bg-emerald-100 border-emerald-300';
    if (status >= 400 && status < 500) return 'text-amber-700 bg-amber-100 border-amber-300';
    if (status >= 500) return 'text-red-700 bg-red-100 border-red-300';
    return 'text-gray-700 bg-gray-100 border-gray-300';
  };

  const getMethodColor = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'POST': return 'text-emerald-700 bg-emerald-100 border-emerald-300';
      case 'PUT': return 'text-amber-700 bg-amber-100 border-amber-300';
      case 'DELETE': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const formatJson = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const renderValue = (value) => {
    if (value === null) return <span className="text-gray-400 italic">null</span>;
    if (value === undefined) return <span className="text-gray-400 italic">undefined</span>;
    if (typeof value === 'boolean') return <span className="text-purple-600 font-semibold">{String(value)}</span>;
    if (typeof value === 'number') return <span className="text-blue-600 font-semibold">{value}</span>;
    if (typeof value === 'string') return <span className="text-green-700">"{value}"</span>;
    if (typeof value === 'object') {
      return (
        <details className="inline">
          <summary className="cursor-pointer text-orange-600 hover:text-orange-700 font-mono text-xs">
            {Array.isArray(value) ? `Array[${value.length}]` : 'Object'}
          </summary>
          <pre className="mt-2 text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
            {formatJson(value)}
          </pre>
        </details>
      );
    }
    return String(value);
  };

  const renderTable = (data) => {
    if (!data || typeof data !== 'object') {
      return (
        <div className="text-sm text-gray-600 font-mono bg-gray-50 p-3 rounded-lg">
          {String(data)}
        </div>
      );
    }
    
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return (
          <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg">
            <span className="text-sm">Empty array []</span>
          </div>
        );
      }
      
      const keys = Object.keys(data[0] || {});
      return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-linear-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b-2 border-gray-300">
                  #
                </th>
                {keys.map((key) => (
                  <th key={key} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b-2 border-gray-300">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx}</td>
                  {keys.map((key) => (
                    <td key={key} className="px-4 py-3 font-mono text-xs">
                      {renderValue(row[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Single object
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-linear-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b-2 border-gray-300 w-1/3">
                Property
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b-2 border-gray-300">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(data).map(([key, value]) => (
              <tr key={key} className="hover:bg-blue-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-50">
                  {key}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {renderValue(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleDevMode}
        className={`fixed bottom-6 right-6 z-100 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
          isOpen 
            ? 'bg-linear-to-br from-black to-gray-800 text-white ring-4 ring-black ring-opacity-20' 
            : 'bg-white text-black border-2 border-black hover:bg-gray-50'
        }`}
        title="Toggle Developer Mode"
      >
        <Code size={24} />
      </button>

      {/* DevTools Panel */}
      {isOpen && (
        <div
          className={`fixed z-90 bg-white border-2 border-black shadow-2xl transition-all duration-300 rounded-xl overflow-hidden ${
            isMinimized 
              ? 'bottom-24 right-6 w-96' 
              : 'bottom-24 right-6 w-[1000px] h-[700px]'
          }`}
        >
          {/* Header */}
          <div className="bg-linear-to-r from-black to-gray-800 text-white px-6 py-4 flex items-center justify-between border-b-4 border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Terminal size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Developer Tools</h3>
                <p className="text-xs text-gray-300">API Monitor & Inspector</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white bg-opacity-10 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-semibold">{apiLogs.length} / 50</span>
              </div>
              <button
                onClick={clearLogs}
                className="flex items-center gap-2 text-sm hover:bg-white hover:text-black px-3 py-1.5 rounded-lg transition-colors"
                title="Clear logs"
              >
                <Trash2 size={16} />
                Clear
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white hover:text-black p-2 rounded-lg transition-colors"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
              </button>
              <button
                onClick={toggleDevMode}
                className="hover:bg-white hover:text-black p-2 rounded-lg transition-colors"
                title="Close DevTools"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="h-[calc(100%-76px)] overflow-y-auto bg-gray-50">
              {apiLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-400 py-12">
                    <div className="bg-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Terminal size={48} className="opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-500 mb-2">No API Calls Yet</h3>
                    <p className="text-sm">Interact with the app to see API logs appear here</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {apiLogs.map((log, index) => (
                    <div key={index} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedLog(expandedLog === index ? null : index)}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${getMethodColor(log.method)}`}>
                            {log.method}
                          </span>
                          <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                          <span className="text-sm font-mono flex-1 truncate text-gray-700 font-semibold">
                            {log.url}
                          </span>
                          <span className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold">
                            ⚡ {log.duration}ms
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                            {expandedLog === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {expandedLog === index && (
                        <div className="border-t-2 border-gray-200 bg-linear-to-b from-white to-gray-50">
                          <div className="p-6 space-y-6">
                            {/* Request Details */}
                            {log.requestData && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b-2 border-blue-200">
                                  <span className="text-2xl">📤</span>
                                  <h4 className="font-bold text-lg text-gray-800">Request Payload</h4>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                  {renderTable(log.requestData)}
                                </div>
                                <details className="text-xs">
                                  <summary className="cursor-pointer font-semibold text-gray-700 hover:text-black px-4 py-2 bg-gray-100 rounded-lg inline-block">
                                    📄 View Raw JSON
                                  </summary>
                                  <pre className="mt-3 bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono text-sm shadow-inner">
                                    {formatJson(log.requestData)}
                                  </pre>
                                </details>
                              </div>
                            )}

                            {/* Response Details */}
                            {log.responseData && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b-2 border-green-200">
                                  <span className="text-2xl">📥</span>
                                  <h4 className="font-bold text-lg text-gray-800">Response Data</h4>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                  {renderTable(log.responseData)}
                                </div>
                                <details className="text-xs">
                                  <summary className="cursor-pointer font-semibold text-gray-700 hover:text-black px-4 py-2 bg-gray-100 rounded-lg inline-block">
                                    📄 View Raw JSON
                                  </summary>
                                  <pre className="mt-3 bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono text-sm shadow-inner">
                                    {formatJson(log.responseData)}
                                  </pre>
                                </details>
                              </div>
                            )}

                            {/* Error Details */}
                            {log.error && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b-2 border-red-200">
                                  <span className="text-2xl">⚠️</span>
                                  <h4 className="font-bold text-lg text-red-700">Error Details</h4>
                                </div>
                                <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
                                  <pre className="text-sm text-red-800 whitespace-pre-wrap font-mono">
                                    {formatJson(log.error)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Headers */}
                            {log.headers && (
                              <details className="text-sm">
                                <summary className="cursor-pointer font-semibold text-gray-700 hover:text-black px-4 py-2 bg-gray-100 rounded-lg inline-block">
                                  🔧 Request Headers
                                </summary>
                                <div className="mt-3 bg-white p-4 rounded-lg border-2 border-gray-200">
                                  <pre className="text-xs font-mono overflow-x-auto">{formatJson(log.headers)}</pre>
                                </div>
                              </details>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DevTools;
