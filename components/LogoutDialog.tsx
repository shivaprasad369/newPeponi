'use client'

interface LogoutDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function LogoutDialog({ isOpen, onClose, onConfirm }: LogoutDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-[400px] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
                <div className="border-b border-gray-100 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-red-50">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">Confirm Log Out</h3>
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg 
                        hover:bg-red-700 active:bg-red-800 
                        shadow-sm shadow-red-200
                        transition-all duration-200"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
