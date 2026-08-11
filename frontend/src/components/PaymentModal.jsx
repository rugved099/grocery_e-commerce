import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function PaymentModal({ isOpen, onClose, farmer, onComplete }) {
    if (!isOpen || !farmer) return null;

    const upiUrl = farmer.upiId 
        ? `upi://pay?pa=${farmer.upiId}&pn=${encodeURIComponent(farmer.farmName || farmer.name)}`
        : '';

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>×</button>
                
                <div className="payment-modal-content">
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-dark)', marginBottom: '8px' }}>
                        Pay {farmer.farmName || farmer.name}
                    </h3>
                    <p>Scan the QR code below using any UPI app (PhonePe, Google Pay, Paytm, etc.) or pay to the UPI ID directly.</p>
                    
                    {farmer.upiId ? (
                        <>
                            <div className="qr-code-wrapper">
                                <QRCodeSVG value={upiUrl} size={200} includeMargin={true} />
                            </div>
                            <div className="payment-details-box">
                                <strong>UPI ID:</strong> <span>{farmer.upiId}</span>
                            </div>
                        </>
                    ) : (
                        <div style={{ margin: '2rem 0', color: 'var(--danger-color)', fontWeight: '600' }}>
                            <p>This farmer has not set up their payment details yet.</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '8px' }}>
                                Please ask them to update their UPI ID in their Dashboard settings.
                            </p>
                        </div>
                    )}
                    
                    <button className="btn" style={{ width: '100%' }} onClick={() => onComplete(farmer)}>
                        I Have Paid
                    </button>
                </div>
            </div>
        </div>
    );
}
