import { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { Button } from '../common/Button';

export function ErpSettingsTab() {
  const { showToast } = useToast();
  const [language, setLanguage] = useState('English (US)');
  const [timezone, setTimezone] = useState('UTC +5:30');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('Light');

  function handleSaveSettings() {
    showToast('Settings saved successfully.', 'success');
  }

  function handleResetSettings() {
    setLanguage('English (US)');
    setTimezone('UTC +5:30');
    setNotifications(true);
    setTheme('Light');
    showToast('Settings reset to defaults.', 'info');
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>
          <i className="fas fa-cog" style={{ color: '#2563eb', marginRight: 10 }} /> Settings
        </h3>
        <span className="tag-blue">Preferences</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ background: '#f8faff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e9edf4' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7a8f' }}>
            Language
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#0b1a33', marginTop: 4 }}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                border: '1px solid #dce2ec',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 13,
                background: '#fff',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
        </div>
        <div style={{ background: '#f8faff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e9edf4' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7a8f' }}>
            Timezone
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#0b1a33', marginTop: 4 }}>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={{
                border: '1px solid #dce2ec',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 13,
                background: '#fff',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option>UTC +5:30</option>
              <option>UTC +0:00</option>
              <option>UTC -5:00 (EST)</option>
              <option>UTC -8:00 (PST)</option>
            </select>
          </div>
        </div>
        <div style={{ background: '#f8faff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e9edf4' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7a8f' }}>
            Notifications
          </div>
          <div
            style={{ fontSize: 14, fontWeight: 500, color: '#0b1a33', marginTop: 4, cursor: 'pointer' }}
            onClick={() => setNotifications(!notifications)}
          >
            <i
              className={`fas ${notifications ? 'fa-bell' : 'fa-bell-slash'}`}
              style={{ color: notifications ? '#2563eb' : '#8e9bb5', marginRight: 6 }}
            />{' '}
            {notifications ? 'Enabled' : 'Disabled'}
          </div>
        </div>
        <div style={{ background: '#f8faff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e9edf4' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7a8f' }}>
            Theme
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#0b1a33', marginTop: 4 }}>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{
                border: '1px solid #dce2ec',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 13,
                background: '#fff',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option>Light</option>
              <option>Dark System</option>
            </select>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button type="button" className="btn-save" onClick={handleSaveSettings}>
          <i className="fas fa-save" /> Save Settings
        </Button>
        <Button type="button" variant="secondary" onClick={handleResetSettings}>
          Reset Default
        </Button>
      </div>
    </div>
  );
}

