'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Upload, MapPin,
  Sparkles, CheckCircle, Camera, X
} from 'lucide-react';
import { CATEGORIES, URGENCY_LEVELS, createIssue } from '@/app/lib/store';
import { categorizeIssue, suggestUrgency, estimateResolutionTime } from '@/app/lib/ai';
import CategoryChip from '@/app/components/CategoryChip';
import MapView from '@/app/components/MapView';

const STEPS = [
  { label: 'Describe', icon: '📝' },
  { label: 'Media', icon: '📸' },
  { label: 'Location', icon: '📍' },
  { label: 'Review', icon: '✅' },
];

export default function ReportIssuePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'medium',
    image: null,
    location: { lat: 28.6139, lng: 77.2090, address: '' },
  });
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // AI auto-categorization as user types
  useEffect(() => {
    const text = `${formData.title} ${formData.description}`;
    if (text.trim().length > 10) {
      const result = categorizeIssue(text);
      setAiSuggestion(result);

      // Auto-fill if no category selected yet
      if (!formData.category && result.confidence > 50) {
        setFormData(prev => ({ ...prev, category: result.category }));
      }

      // Suggest urgency
      const urgency = suggestUrgency(text);
      if (urgency !== 'medium') {
        setFormData(prev => ({ ...prev, urgency }));
      }
    }
  }, [formData.title, formData.description]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              lat,
              lng,
            }
          }));

          try {
            // Reverse geocode to get address
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
              setFormData(prev => ({
                ...prev,
                location: {
                  ...prev.location,
                  address: data.display_name
                }
              }));
            }
          } catch (error) {
            console.error('Error fetching address:', error);
          }
        },
        () => {
          // Default Delhi coordinates if geolocation fails
          alert('Could not get your location. Using default location.');
        }
      );
    }
  };

  const handleSubmit = () => {
    const newIssue = createIssue({
      title: formData.title,
      description: formData.description,
      category: formData.category || 'other',
      urgency: formData.urgency,
      status: 'reported',
      image: formData.image,
      location: formData.location,
    });
    setSubmitted(true);
    setTimeout(() => {
      router.push(`/issues/${newIssue.id}`);
    }, 2000);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return formData.title.trim().length >= 3 && formData.description.trim().length >= 3;
      case 1: return true; // Media is optional
      case 2: return formData.location.address.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  if (submitted) {
    return (
      <div className="empty-state animate-scale-in">
        <div className="empty-state-icon">🎉</div>
        <h2 className="empty-state-title">Issue Reported Successfully!</h2>
        <p className="empty-state-text">
          Thank you for making your community better. You&apos;ve earned <strong style={{ color: 'var(--accent-blue)' }}>+50 XP</strong> for this report.
          Redirecting to your issue...
        </p>
      </div>
    );
  }

  const estimatedDays = estimateResolutionTime(formData.category || 'other', formData.urgency);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-title-gradient">Report an Issue</span>
        </h1>
        <p className="page-subtitle">Help your community by reporting local problems</p>
      </div>

      <div className="report-form-container">
        {/* Step Indicator */}
        <div className="form-steps">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`form-step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
            >
              <div className="form-step-number">
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className="form-step-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Describe */}
        {step === 0 && (
          <div className="form-panel glass-card">
            <div className="form-group">
              <label className="form-label">Issue Title *</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g., Large pothole on MG Road near City Mall"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-textarea"
                placeholder="Describe the issue in detail — size, severity, how long it's been there, impact on residents..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            {/* AI Categorization Preview */}
            {aiSuggestion && aiSuggestion.confidence > 30 && (
              <div className="ai-preview animate-slide-up">
                <span className="ai-preview-icon"><Sparkles size={16} /></span>
                <span className="ai-preview-text">
                  AI suggests: <span className="ai-preview-category">
                    {CATEGORIES.find(c => c.id === aiSuggestion.category)?.icon}{' '}
                    {CATEGORIES.find(c => c.id === aiSuggestion.category)?.label}
                  </span>
                </span>
                <span className="ai-preview-confidence">{aiSuggestion.confidence}% match</span>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`filter-chip ${formData.category === cat.id ? 'active' : ''}`}
                    style={formData.category === cat.id ? { borderColor: cat.color, color: cat.color, background: `${cat.color}15` } : {}}
                    onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Urgency Level</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {URGENCY_LEVELS.map(u => (
                  <button
                    key={u.id}
                    className={`filter-chip ${formData.urgency === u.id ? 'active' : ''}`}
                    style={formData.urgency === u.id ? { borderColor: u.color, color: u.color, background: `${u.color}15` } : {}}
                    onClick={() => setFormData(prev => ({ ...prev, urgency: u.id }))}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Media */}
        {step === 1 && (
          <div className="form-panel glass-card">
            <div className="form-group">
              <label className="form-label">Upload Photo (Optional)</label>
              <div
                className={`upload-area ${dragOver ? 'dragover' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="upload-icon">
                  <Camera size={36} style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <div className="upload-text">
                  Click to upload or drag and drop
                </div>
                <div className="upload-hint">
                  PNG, JPG up to 5MB
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {formData.image && (
                <div className="upload-preview">
                  <div className="upload-preview-item">
                    <img src={formData.image} alt="Preview" />
                    <button
                      className="upload-preview-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, image: null }));
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 2 && (
          <div className="form-panel glass-card">
            <div className="form-group">
              <label className="form-label">Location Address *</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g., MG Road, near City Mall, Sector 14"
                value={formData.location.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, address: e.target.value }
                }))}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleGetLocation}>
                <MapPin size={14} /> Use My Location
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Pin on Map</label>
              <MapView
                issues={[]}
                center={[formData.location.lat, formData.location.lng]}
                zoom={14}
                height="280px"
              />
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                Map shows your selected location. Enter the address above to describe the exact spot.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 3 && (
          <div className="form-panel glass-card">
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700 }}>
              Review Your Report
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div className="form-label" style={{ marginBottom: '4px' }}>Title</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{formData.title}</div>
              </div>

              <div>
                <div className="form-label" style={{ marginBottom: '4px' }}>Description</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {formData.description}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div className="form-label" style={{ marginBottom: '4px' }}>Category</div>
                  <CategoryChip category={formData.category} />
                </div>
                <div>
                  <div className="form-label" style={{ marginBottom: '4px' }}>Urgency</div>
                  <span className={`chip chip-urgency ${formData.urgency}`}>
                    {formData.urgency}
                  </span>
                </div>
              </div>

              <div>
                <div className="form-label" style={{ marginBottom: '4px' }}>Location</div>
                <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} /> {formData.location.address || 'Not specified'}
                </div>
              </div>

              {formData.image && (
                <div>
                  <div className="form-label" style={{ marginBottom: '4px' }}>Photo</div>
                  <img
                    src={formData.image}
                    alt="Issue"
                    style={{ maxWidth: '200px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}
                  />
                </div>
              )}

              {/* AI Analysis Preview */}
              <div className="ai-preview" style={{ marginTop: '8px' }}>
                <span className="ai-preview-icon">🤖</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>AI Estimated Resolution</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Based on category and urgency, estimated resolution time: <strong style={{ color: 'var(--accent-blue)' }}>{estimatedDays} days</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="form-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            style={{ opacity: step === 0 ? 0.5 : 1 }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {step < 3 ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              style={{ opacity: canProceed() ? 1 : 0.5 }}
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
              <CheckCircle size={18} /> Submit Report
            </button>
          )}
        </div>
      </div>
    </>
  );
}
