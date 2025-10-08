import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patientName: string;
  isDeleting?: boolean;
}

export function DeleteConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  patientName, 
  isDeleting = false 
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-3 shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <AlertTriangle className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Delete Patient
                  </h2>
                  <p className="text-slate-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100"
                disabled={isDeleting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50 mb-6">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Warning:</strong> You are about to permanently delete the patient record for{' '}
                <strong>{patientName}</strong>. This action cannot be undone and all associated data will be lost.
              </AlertDescription>
            </Alert>

            <div className="text-slate-700 mb-6">
              <p className="mb-2">Are you sure you want to delete this patient record?</p>
              <ul className="text-sm text-slate-600 space-y-1 ml-4">
                <li>• Patient information will be permanently removed</li>
                <li>• Medication history will be lost</li>
                <li>• This action cannot be reversed</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl px-6"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onConfirm}
                  className="rounded-xl px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <motion.div 
                        className="rounded-full h-4 w-4 border-b-2 border-white mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Deleting...
                    </>
                  ) : (
                    'Delete Patient'
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
