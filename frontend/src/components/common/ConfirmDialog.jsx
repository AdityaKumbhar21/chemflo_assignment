import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import Modal from './Modal';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center py-4">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'
          }`}
        >
          <ExclamationTriangleIcon
            className={`w-8 h-8 ${
              variant === 'danger' ? 'text-red-600' : 'text-amber-600'
            }`}
          />
        </div>
        <p className="text-gray-600">{message}</p>
      </div>
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
