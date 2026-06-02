// src/components/Equipment/SlotPicker.jsx — Date + time slot + hours picker with live price
import React, { useState } from 'react';
import './SlotPicker.css';
import { calculateBookingCost } from '../../data/mockEquipment';

const today = new Date().toISOString().split('T')[0];

export default function SlotPicker({ equipment, availSlots, onConfirm, onCancel }) {
  const [date,        setDate]   = useState('');
  const [selectedSlot, setSlot]  = useState(null);
  const [hours,       setHours]  = useState(2);

  const cost = calculateBookingCost(equipment.ratePerHour, hours);

  const canConfirm = date && selectedSlot;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm({
      date,
      slotId:    selectedSlot.id,
      slotLabel: selectedSlot.label,
      hours,
      ...cost,
    });
  };

  return (
    <div className="sp-wrap">
      <div className="sp-title">📅 Select Date &amp; Slot</div>

      {/* Date */}
      <div className="sp-row">
        <label className="sp-label">Date — तारीख</label>
        <input
          type="date"
          className="sp-date-input"
          min={today}
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {/* Time slot */}
      <div className="sp-row">
        <label className="sp-label">Time Slot — समय स्लॉट</label>
        <div className="sp-slots">
          {availSlots.map(s => (
            <button
              key={s.id}
              className={`sp-slot-btn ${selectedSlot?.id === s.id ? 'selected' : ''}`}
              onClick={() => setSlot(s)}
              type="button"
            >
              🕐 {s.label}
            </button>
          ))}
          {availSlots.length === 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No slots available</span>
          )}
        </div>
      </div>

      {/* Hours */}
      <div className="sp-row">
        <label className="sp-label">Hours needed — घंटे</label>
        <div className="sp-hours-row">
          <button
            className="sp-hours-btn"
            type="button"
            onClick={() => setHours(h => Math.max(1, h - 1))}
          >−</button>
          <span className="sp-hours-val">{hours}</span>
          <span className="sp-hours-lbl">hours</span>
          <button
            className="sp-hours-btn"
            type="button"
            onClick={() => setHours(h => Math.min(8, h + 1))}
          >+</button>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="sp-price-box">
        <div className="sp-price-row">
          <span>{hours} hrs × ₹{equipment.ratePerHour}/hr</span>
          <span>₹{cost.base.toLocaleString('en-IN')}</span>
        </div>
        <div className="sp-price-row">
          <span>Platform fee (15%)</span>
          <span>+ ₹{cost.platformFee.toLocaleString('en-IN')}</span>
        </div>
        <div className="sp-price-divider" />
        <div className="sp-price-row sp-price-total">
          <span>You Pay (Total)</span>
          <span>₹{cost.total.toLocaleString('en-IN')}</span>
        </div>
        <div className="sp-price-row" style={{ marginTop: 4 }}>
          <span style={{ color: '#16A34A', fontWeight: 600 }}>Owner receives</span>
          <span style={{ color: '#16A34A', fontWeight: 600 }}>₹{cost.ownerGets.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Escrow note */}
      <div className="sp-escrow-note">
        <span className="sp-escrow-dot" />
        Payment goes to Razorpay Escrow. Owner receives only after service is confirmed.
      </div>

      {/* Actions */}
      <div className="sp-actions">
        <button className="sp-cancel-btn" onClick={onCancel} type="button">
          Cancel
        </button>
        <button
          className="sp-confirm-btn"
          onClick={handleConfirm}
          disabled={!canConfirm}
          type="button"
        >
          {canConfirm ? `🔒 Confirm Booking — ₹${cost.total.toLocaleString('en-IN')}` : 'Select date & slot'}
        </button>
      </div>
    </div>
  );
}
