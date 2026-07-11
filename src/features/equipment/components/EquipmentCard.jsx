// src/components/Equipment/EquipmentCard.jsx — Equipment listing card with booking trigger
import React, { useState } from 'react';
import './EquipmentCard.css';
import { MOCK_OWNERS, TIME_SLOTS, getEquipmentType } from '@/data/mockEquipment';
import SlotPicker from './SlotPicker';

export default function EquipmentCard({ equipment, onBook, bookedBookingId }) {
  const [showPicker, setShowPicker] = useState(false);

  const owner   = MOCK_OWNERS.find(o => o.ownerId === equipment.ownerId) || {};
  const eqType  = getEquipmentType(equipment.type);
  const isBooked = !!bookedBookingId || !equipment.isAvailable;

  const availSlots = TIME_SLOTS.filter(s => equipment.availableSlots?.includes(s.id));

  return (
    <div className={`eq-card ${isBooked && !equipment.isAvailable ? 'unavailable' : ''}`}>
      {/* Header */}
      <div className="eq-card-header">
        <div className="eq-card-icon-wrap">{eqType.icon}</div>
        <div className="eq-card-main">
          <div className="eq-card-name">{equipment.brand} {equipment.model}</div>
          <div className="eq-card-brand">{eqType.label} · {equipment.districts?.[0]}</div>
          <div className="eq-card-badges">
            {equipment.isAvailable
              ? <span className="eq-badge eq-badge-avail">● Available</span>
              : <span className="eq-badge eq-badge-booked">○ Currently Booked</span>
            }
            {equipment.dgcaCert && (
              <span className="eq-badge eq-badge-dgca">✓ DGCA Certified</span>
            )}
            <span className="eq-badge eq-badge-type">{eqType.icon} {eqType.label}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="eq-card-stats">
        <div className="eq-stat">
          <div className="eq-stat-val">₹{equipment.ratePerHour}</div>
          <div className="eq-stat-lbl">per hour</div>
        </div>
        <div className="eq-stat">
          <div className="eq-stat-val">{equipment.coveragePerHour}</div>
          <div className="eq-stat-lbl">acres/hour</div>
        </div>
        <div className="eq-stat">
          <div className="eq-stat-val">⭐ {equipment.rating}</div>
          <div className="eq-stat-lbl">{equipment.totalBookings} jobs</div>
        </div>
      </div>

      {/* Owner */}
      <div className="eq-card-owner">
        <div className="eq-owner-avatar">{owner.avatar || '👤'}</div>
        <div className="eq-owner-info">
          <div className="eq-owner-name">{owner.name}</div>
          <div className="eq-owner-meta">📍 {owner.district} · {equipment.totalBookings} completed jobs</div>
        </div>
        <div className="eq-owner-rating">⭐ {owner.rating}</div>
      </div>

      {/* Description */}
      <div className="eq-card-desc">
        {equipment.description}
        <div className="eq-card-desc-hi">{equipment.descriptionHi}</div>
      </div>

      {/* Districts served */}
      <div className="eq-districts">
        {(equipment.districts || []).map(d => (
          <span key={d} className="eq-district-chip">📍 {d}</span>
        ))}
      </div>

      {/* Available slots */}
      {availSlots.length > 0 && (
        <div className="eq-slots">
          {availSlots.map(s => (
            <span key={s.id} className="eq-slot-chip">🕐 {s.label}</span>
          ))}
        </div>
      )}

      {/* Book button */}
      {!showPicker ? (
        <button
          className={`eq-book-btn ${bookedBookingId ? 'booked-state' : ''}`}
          disabled={!equipment.isAvailable || !!bookedBookingId}
          onClick={() => setShowPicker(true)}
        >
          {bookedBookingId
            ? '✅ Booking Confirmed!'
            : equipment.isAvailable
              ? '📅 Select Slot & Book'
              : '⏳ Currently Unavailable'}
        </button>
      ) : (
        <SlotPicker
          equipment={equipment}
          availSlots={availSlots}
          onCancel={() => setShowPicker(false)}
          onConfirm={(bookingData) => {
            setShowPicker(false);
            onBook?.(equipment, bookingData);
          }}
        />
      )}
    </div>
  );
}

