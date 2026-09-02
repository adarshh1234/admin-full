import { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import type { PersonalDetails } from '../../types/module';

export function ProfilePage() {
  const { showToast } = useToast();
  const [form, setForm] = useState<PersonalDetails>({
    firstName: 'John',
    lastName: 'Doe',
    dob: '15/06/1990',
    gender: 'Prefer not to say',
    nationality: 'Indian',
    aboutMe: 'Experienced ERP consultant with 8+ years in digital transformation.',
  });

  function handleChange(field: keyof PersonalDetails, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    showToast('Personal details saved successfully!', 'success');
  }

  function handleCancel() {
    setForm({
      firstName: 'John',
      lastName: 'Doe',
      dob: '15/06/1990',
      gender: 'Prefer not to say',
      nationality: 'Indian',
      aboutMe: 'Experienced ERP consultant with 8+ years in digital transformation.',
    });
    showToast('Form reset to default values.', 'info');
  }

  return (
    <div className="panel profile-card" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0b1a33', marginBottom: 4 }}>Personal Details</h2>
      <p style={{ color: '#6b7a8f', fontSize: 14, marginBottom: 24 }}>Your identity information.</p>

      <div className="photo-section">
        <div className="avatar">
          <i className="fas fa-camera" />
        </div>
        <div className="photo-info">
          <strong style={{ color: '#0b1a33', display: 'block' }}>Profile Photo</strong> Click the camera icon to upload
          <br />
          <small style={{ fontSize: 12, color: '#6b7a8f' }}>JPG, PNG or WebP · max 5 MB</small>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0b1a33', marginBottom: 4 }}>
            Full Name
          </label>
          <div className="form-row">
            <div>
              <label style={{ fontSize: 12, fontWeight: 400, color: '#6b7a8f', marginBottom: 2, display: 'block' }}>
                First Name *
              </label>
              <Input
                className="form-control"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 400, color: '#6b7a8f', marginBottom: 2, display: 'block' }}>
                Last Name *
              </label>
              <Input
                className="form-control"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0b1a33', marginBottom: 4 }}>
              Date of Birth
            </label>
            <Input
              className="form-control"
              value={form.dob}
              placeholder="dd/mm/yyyy"
              onChange={(e) => handleChange('dob', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0b1a33', marginBottom: 4 }}>
              Gender
            </label>
            <select
              className="form-control"
              value={form.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option>Prefer not to say</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0b1a33', marginBottom: 4 }}>
            Nationality
          </label>
          <Input
            className="form-control"
            value={form.nationality}
            placeholder="e.g. Indian, British"
            onChange={(e) => handleChange('nationality', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0b1a33', marginBottom: 4 }}>
            About Me
          </label>
          <textarea
            className="form-control"
            placeholder="Write a short professional summary..."
            value={form.aboutMe}
            rows={3}
            onChange={(e) => handleChange('aboutMe', e.target.value)}
          />
          <div className="char-count">{form.aboutMe.length}/500 characters</div>
        </div>

        <div
          className="form-actions"
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid #e9edf4',
          }}
        >
          <Button type="submit" variant="primary">
            <i className="fas fa-save" /> Save Personal Details
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
