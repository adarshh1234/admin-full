import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useToast } from '../../hooks/useToast';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export function ErpProfileTab() {
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [dob, setDob] = useState('15/06/1990');
  const [gender, setGender] = useState('Prefer not to say');
  const [nationality, setNationality] = useState('Indian');
  const [aboutMe, setAboutMe] = useState(
    'Experienced ERP consultant with 8+ years in digital transformation. Passionate about building scalable systems.',
  );
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file must be less than 5 MB.', 'error');
        return;
      }
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      showToast('Profile photo updated successfully!', 'success');
    }
  }

  function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    showToast('Personal details saved successfully.', 'success');
  }

  function handleProfileReset() {
    setFirstName('John');
    setLastName('Doe');
    setDob('15/06/1990');
    setGender('Prefer not to say');
    setNationality('Indian');
    setAboutMe(
      'Experienced ERP consultant with 8+ years in digital transformation. Passionate about building scalable systems.',
    );
    showToast('Form reset to default values.', 'info');
  }

  return (
    <div className="profile-card">
      <h2>Personal Details</h2>
      <p className="subhead">Your identity information.</p>

      <form onSubmit={handleProfileSave}>
        {/* Photo Section */}
        <div className="photo-section">
          <Input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />
          <div
            className="avatar"
            title="Click to upload photo"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <i className="fas fa-camera" />
            )}
          </div>
          <div className="photo-info">
            <strong>Profile Photo</strong>
            Click the camera icon to upload
            <br />
            <small>JPG, PNG or WebP · max 5 MB</small>
          </div>
        </div>

        {/* Full Name */}
        <div className="form-group">
          <label>Full Name</label>
          <div className="form-row">
            <div>
              <label style={{ fontSize: 12, fontWeight: 400, color: '#6b7a8f' }}>
                First Name <span className="required">*</span>
              </label>
              <Input
                type="text"
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 400, color: '#6b7a8f' }}>
                Last Name <span className="required">*</span>
              </label>
              <Input
                type="text"
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                required
              />
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="form-row">
          <div className="form-group">
            <label>Date of Birth</label>
            <Input
              type="text"
              className="form-control"
              placeholder="dd/mm/yyyy"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select
              className="form-control"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option>Prefer not to say</option>
              <option>Male</option>
              <option>Female</option>
              <option>Non-binary</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Nationality</label>
          <Input
            type="text"
            className="form-control"
            placeholder="e.g. Indian, British, American"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          />
        </div>

        {/* About Me */}
        <div className="form-group">
          <label>About Me</label>
          <textarea
            className="form-control"
            maxLength={500}
            placeholder="Write a short professional summary about yourself..."
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
          />
          <div className="char-count">{aboutMe.length}/500 characters</div>
        </div>

        <div className="form-actions">
          <Button type="submit" className="btn-save">
            <i className="fas fa-save" /> Save Personal Details
          </Button>
          <Button type="button" variant="secondary" onClick={handleProfileReset}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

