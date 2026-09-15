import React, { useState, useEffect, useRef } from 'react';
import type { LandingPageCmsData } from '../../types/cms';
import { cmsService } from '../../services/cms.service';
import { useToast } from '../../hooks/useToast';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';

type CmsTab =
  | 'visibility'
  | 'hero'
  | 'cinematic'
  | 'stats'
  | 'features'
  | 'dimensions'
  | 'blog'
  | 'video'
  | 'testimonials'
  | 'cta-footer';

export function CmsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<CmsTab>('hero');
  const [cmsData, setCmsData] = useState<LandingPageCmsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetField, setUploadTargetField] = useState<string | null>(null);

  // Load CMS data on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await cmsService.getCmsData('draft');
      setCmsData(data);
    } catch (err: any) {
      console.error('Failed to load CMS data:', err);
      showToast('Could not reach backend API, loading defaults.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft() {
    if (!cmsData) return;
    setSaving(true);
    try {
      const updated = await cmsService.saveDraft(cmsData);
      setCmsData(updated);
      showToast('CMS draft saved successfully to database!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!cmsData) return;
    setPublishing(true);
    try {
      // First ensure current draft is saved
      await cmsService.saveDraft(cmsData);
      const published = await cmsService.publishContent();
      setCmsData(published);
      showToast('🎉 Landing page published LIVE! Visitors now see the latest changes.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Publish failed: ${err.message}`, 'error');
    } finally {
      setPublishing(false);
    }
  }

  async function handleReset() {
    if (!window.confirm('Reset all CMS content back to initial defaults?')) return;
    setLoading(true);
    try {
      const resetData = await cmsService.resetToDefaults();
      setCmsData(resetData);
      showToast('CMS content reset to baseline defaults.', 'info');
    } catch (err: any) {
      showToast(`Reset failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleTriggerUpload(fieldPath: string) {
    setUploadTargetField(fieldPath);
    fileInputRef.current?.click();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetField) return;
    setUploading(true);
    try {
      const result = await cmsService.uploadMedia(file);
      showToast('Media uploaded successfully!', 'success');
      // Set field value in state
      updateNestedField(uploadTargetField, result.url);
    } catch (err: any) {
      showToast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function updateNestedField(path: string, value: any) {
    if (!cmsData) return;
    const parts = path.split('.');
    setCmsData((prev) => {
      if (!prev) return prev;
      const clone = JSON.parse(JSON.stringify(prev));
      let curr = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = value;
      return clone;
    });
  }

  if (loading || !cmsData) {
    return (
      <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
        <Loader label="Connecting to CMS Backend & Database..." />
      </div>
    );
  }

  return (
    <div className="cms-admin-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Hidden file upload input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept="image/*,video/*"
      />

      {/* Top Header Card */}
      <div
        className="panel"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
          background: 'linear-gradient(135deg, #0a192f 0%, #063970 100%)',
          color: '#fff',
          borderRadius: 16,
          padding: '24px 28px',
          boxShadow: '0 10px 25px rgba(6, 40, 79, 0.15)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              <i className="fas fa-layer-group" />
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>
              Landing Page CMS
            </h2>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 20,
                background: cmsData.status === 'published' ? '#10b981' : '#f59e0b',
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {cmsData.status === 'published' ? '● Live Published' : '● Draft Mode'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#bae6fd' }}>
            Manage and publish dynamic content for the LetGetIn public landing page with real database persistence.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            style={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: '#fff',
              background: 'rgba(255,255,255,0.08)',
              fontSize: 13,
            }}
          >
            <i className="fas fa-undo" style={{ marginRight: 6 }} /> Reset Defaults
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            style={{
              background: '#2563eb',
              color: '#fff',
              borderColor: '#2563eb',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <i className={saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'} style={{ marginRight: 6 }} />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handlePublish}
            disabled={publishing || saving}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderColor: '#059669',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <i className={publishing ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'} style={{ marginRight: 6 }} />
            {publishing ? 'Publishing...' : 'Publish Live'}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tab-nav crm-tab-nav" style={{ marginBottom: 20, overflowX: 'auto' }}>
        {[
          { id: 'hero', label: 'Hero Section', icon: 'fa-star' },
          { id: 'cinematic', label: 'Cinematic Showcase', icon: 'fa-play-circle' },
          { id: 'stats', label: 'Stats & The Shift', icon: 'fa-chart-bar' },
          { id: 'features', label: 'Core Features', icon: 'fa-cube' },
          { id: 'dimensions', label: '6 Dimensions', icon: 'fa-shapes' },
          { id: 'blog', label: 'Editorial Matrix', icon: 'fa-book-open' },
          { id: 'video', label: 'Video Showcase', icon: 'fa-video' },
          { id: 'testimonials', label: 'Why & Testimonials', icon: 'fa-quote-left' },
          { id: 'cta-footer', label: 'CTA & Footer', icon: 'fa-flag' },
          { id: 'visibility', label: 'Section Visibility', icon: 'fa-toggle-on' },
        ].map((t) => (
          <Button
            key={t.id}
            type="button"
            className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id as CmsTab)}
            style={{ fontSize: 13, padding: '9px 15px' }}
          >
            <i className={`fas ${t.icon}`} style={{ marginRight: 6 }} />
            <span>{t.label}</span>
          </Button>
        ))}
      </div>

      {/* TAB 1: HERO SECTION */}
      {activeTab === 'hero' && (
        <div className="panel" style={{ padding: 24 }}>
          <div className="header" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a2540', margin: 0 }}>
              Hero Section Settings
            </h3>
            <span className="tag-blue">First Impression & Candidates Card</span>
          </div>

          <div className="fields">
            <div className="field-group half">
              <label>Top Tag Badge</label>
              <Input
                className="form-control"
                value={cmsData.hero.tagBadge}
                onChange={(e) => updateNestedField('hero.tagBadge', e.target.value)}
              />
            </div>

            <div className="field-group half">
              <label>Main Headline Line 1</label>
              <Input
                className="form-control"
                value={cmsData.hero.headlineLine1}
                onChange={(e) => updateNestedField('hero.headlineLine1', e.target.value)}
              />
            </div>

            <div className="field-group half">
              <label>Headline Line 2 (Blue Gradient Highlight)</label>
              <Input
                className="form-control"
                value={cmsData.hero.headlineLine2Gradient}
                onChange={(e) => updateNestedField('hero.headlineLine2Gradient', e.target.value)}
              />
            </div>

            <div className="field-group half">
              <label>Primary CTA Button Text</label>
              <Input
                className="form-control"
                value={cmsData.hero.primaryCtaText}
                onChange={(e) => updateNestedField('hero.primaryCtaText', e.target.value)}
              />
            </div>

            <div className="field-group half">
              <label>Secondary CTA Button Text</label>
              <Input
                className="form-control"
                value={cmsData.hero.secondaryCtaText}
                onChange={(e) => updateNestedField('hero.secondaryCtaText', e.target.value)}
              />
            </div>

            <div className="field-group full" style={{ gridColumn: 'span 2' }}>
              <label>Subtitle Description</label>
              <textarea
                className="form-control"
                rows={2}
                value={cmsData.hero.subtitle}
                onChange={(e) => updateNestedField('hero.subtitle', e.target.value)}
              />
            </div>

            <div className="field-group full" style={{ gridColumn: 'span 2' }}>
              <label>Subtitle Bold Highlight</label>
              <Input
                className="form-control"
                value={cmsData.hero.subtitleHighlight}
                onChange={(e) => updateNestedField('hero.subtitleHighlight', e.target.value)}
              />
            </div>
          </div>

          {/* Candidate Showcase Profiles */}
          <div style={{ marginTop: 28 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#06284f', marginBottom: 12 }}>
              Hero Showcase Candidate Profiles
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {cmsData.hero.profiles.map((prof, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #e2edf8',
                    borderRadius: 12,
                    padding: 16,
                    background: '#f8faff',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#06284f', marginBottom: 10 }}>
                    Profile #{idx + 1}: {prof.name} ({prof.initials})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, color: '#6b7a99' }}>Full Name</label>
                      <Input
                        className="form-control"
                        value={prof.name}
                        onChange={(e) => {
                          const updated = [...cmsData.hero.profiles];
                          updated[idx].name = e.target.value;
                          updateNestedField('hero.profiles', updated);
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: '#6b7a99' }}>Role / Title</label>
                      <Input
                        className="form-control"
                        value={prof.role}
                        onChange={(e) => {
                          const updated = [...cmsData.hero.profiles];
                          updated[idx].role = e.target.value;
                          updateNestedField('hero.profiles', updated);
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: '#6b7a99' }}>Fit Score</label>
                        <Input
                          className="form-control"
                          value={prof.fitScore}
                          onChange={(e) => {
                            const updated = [...cmsData.hero.profiles];
                            updated[idx].fitScore = e.target.value;
                            updateNestedField('hero.profiles', updated);
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: '#6b7a99' }}>Tier</label>
                        <Input
                          className="form-control"
                          value={prof.tier}
                          onChange={(e) => {
                            const updated = [...cmsData.hero.profiles];
                            updated[idx].tier = e.target.value;
                            updateNestedField('hero.profiles', updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CINEMATIC VIDEO SHOWCASE */}
      {activeTab === 'cinematic' && (
        <div className="panel" style={{ padding: 24 }}>
          <div className="header" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a2540', margin: 0 }}>
              Cinematic Video Showcase Settings
            </h3>
            <span className="tag-blue">Full-width Video Header</span>
          </div>

          <div className="fields">
            <div className="field-group half">
              <label>Top Heading</label>
              <Input
                className="form-control"
                value={cmsData.cinematicVideoShowcase.topHeading}
                onChange={(e) => updateNestedField('cinematicVideoShowcase.topHeading', e.target.value)}
              />
            </div>

            <div className="field-group half">
              <label>Top Badge Text</label>
              <Input
                className="form-control"
                value={cmsData.cinematicVideoShowcase.topBadge}
                onChange={(e) => updateNestedField('cinematicVideoShowcase.topBadge', e.target.value)}
              />
            </div>

            <div className="field-group full" style={{ gridColumn: 'span 2' }}>
              <label>Primary Video URL (MP4 / WebM / Stream)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  className="form-control"
                  value={cmsData.cinematicVideoShowcase.videoUrls[0] || ''}
                  onChange={(e) => {
                    const urls = [...cmsData.cinematicVideoShowcase.videoUrls];
                    urls[0] = e.target.value;
                    updateNestedField('cinematicVideoShowcase.videoUrls', urls);
                  }}
                />
                <Button
                  variant="outline"
                  type="button"
                  disabled={uploading}
                  onClick={() => handleTriggerUpload('cinematicVideoShowcase.videoUrls.0')}
                >
                  <i className={uploading ? 'fas fa-spinner fa-spin' : 'fas fa-upload'} /> {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>

            <div className="field-group full" style={{ gridColumn: 'span 2' }}>
              <label>Poster / Fallback Image URL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  className="form-control"
                  value={cmsData.cinematicVideoShowcase.posterImage}
                  onChange={(e) => updateNestedField('cinematicVideoShowcase.posterImage', e.target.value)}
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => handleTriggerUpload('cinematicVideoShowcase.posterImage')}
                >
                  <i className="fas fa-upload" /> Upload
                </Button>
              </div>
            </div>

            <div className="field-group half">
              <label>Match Accuracy Metric</label>
              <Input
                className="form-control"
                value={cmsData.cinematicVideoShowcase.stats.matchRate}
                onChange={(e) => updateNestedField('cinematicVideoShowcase.stats.matchRate', e.target.value)}
              />
            </div>

            <div className="field-group half">
              <label>Assessment Volume Metric</label>
              <Input
                className="form-control"
                value={cmsData.cinematicVideoShowcase.stats.assessmentVolume}
                onChange={(e) => updateNestedField('cinematicVideoShowcase.stats.assessmentVolume', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATS & THE SHIFT */}
      {activeTab === 'stats' && (
        <div className="panel" style={{ padding: 24 }}>
          <div className="header" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a2540', margin: 0 }}>
              Stats & The Shift Settings
            </h3>
            <span className="tag-blue">Metrics & Old vs New Comparison</span>
          </div>

          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#06284f', marginBottom: 12 }}>
            Key Metrics Row
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
            {cmsData.statsAndShift.stats.map((st, i) => (
              <div key={i} style={{ border: '1px solid #e2edf8', borderRadius: 10, padding: 12, background: '#f8faff' }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7a99' }}>Stat #{i + 1} Number</label>
                <Input
                  className="form-control"
                  style={{ marginBottom: 6 }}
                  value={st.value}
                  onChange={(e) => {
                    const stats = [...cmsData.statsAndShift.stats];
                    stats[i].value = e.target.value;
                    updateNestedField('statsAndShift.stats', stats);
                  }}
                />
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7a99' }}>Label</label>
                <Input
                  className="form-control"
                  style={{ marginBottom: 6 }}
                  value={st.label}
                  onChange={(e) => {
                    const stats = [...cmsData.statsAndShift.stats];
                    stats[i].label = e.target.value;
                    updateNestedField('statsAndShift.stats', stats);
                  }}
                />
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7a99' }}>Subtext</label>
                <Input
                  className="form-control"
                  value={st.sub}
                  onChange={(e) => {
                    const stats = [...cmsData.statsAndShift.stats];
                    stats[i].sub = e.target.value;
                    updateNestedField('statsAndShift.stats', stats);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="fields">
            <div className="field-group half">
              <label>Section Tag</label>
              <Input
                className="form-control"
                value={cmsData.statsAndShift.sectionTag}
                onChange={(e) => updateNestedField('statsAndShift.sectionTag', e.target.value)}
              />
            </div>

            <div className="field-group half">
              <label>Heading Line 1</label>
              <Input
                className="form-control"
                value={cmsData.statsAndShift.headingLine1}
                onChange={(e) => updateNestedField('statsAndShift.headingLine1', e.target.value)}
              />
            </div>

            <div className="field-group full" style={{ gridColumn: 'span 2' }}>
              <label>Subtitle</label>
              <textarea
                className="form-control"
                rows={2}
                value={cmsData.statsAndShift.subtitle}
                onChange={(e) => updateNestedField('statsAndShift.subtitle', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CORE FEATURES */}
      {activeTab === 'features' && (
        <div className="panel" style={{ padding: 24 }}>
          <div className="header" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a2540', margin: 0 }}>
              Core Features (OS) Settings
            </h3>
            <span className="tag-blue">6 Main Architecture Features</span>
          </div>

          <div className="fields" style={{ marginBottom: 20 }}>
            <div className="field-group half">
              <label>Section Tag</label>
              <Input
                className="form-control"
                value={cmsData.corePlatformOS.sectionTag}
                onChange={(e) => updateNestedField('corePlatformOS.sectionTag', e.target.value)}
              />
            </div>
            <div className="field-group half">
              <label>Title Suffix / Main Heading</label>
              <Input
                className="form-control"
                value={cmsData.corePlatformOS.titleSuffix}
                onChange={(e) => updateNestedField('corePlatformOS.titleSuffix', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {cmsData.corePlatformOS.features.map((feat, idx) => (
              <div key={feat.id} style={{ border: '1px solid #e2edf8', borderRadius: 12, padding: 16, background: '#f8faff' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0066cc', marginBottom: 8 }}>
                  Feature #{idx + 1}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7a99' }}>Title</label>
                    <Input
                      className="form-control"
                      value={feat.title}
                      onChange={(e) => {
                        const feats = [...cmsData.corePlatformOS.features];
                        feats[idx].title = e.target.value;
                        updateNestedField('corePlatformOS.features', feats);
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7a99' }}>Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={feat.description}
                      onChange={(e) => {
                        const feats = [...cmsData.corePlatformOS.features];
                        feats[idx].description = e.target.value;
                        updateNestedField('corePlatformOS.features', feats);
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7a99' }}>Bottom Tag</label>
                    <Input
                      className="form-control"
                      value={feat.tag}
                      onChange={(e) => {
                        const feats = [...cmsData.corePlatformOS.features];
                        feats[idx].tag = e.target.value;
                        updateNestedField('corePlatformOS.features', feats);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: 6 DIMENSIONS */}
      {activeTab === 'dimensions' && (
        <div className="panel" style={{ padding: 24 }}>
          <div className="header" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a2540', margin: 0 }}>
              The 6 Dimensions of Talent
            </h3>
            <span className="tag-blue">Candidate Evaluation Framework</span>
          </div>

          <div className="fields" style={{ marginBottom: 20 }}>
            <div className="field-group half">
              <label>Section Tag</label>
              <Input
                className="form-control"
                value={cmsData.dimensionsOfTalent.sectionTag}
                onChange={(e) => updateNestedField('dimensionsOfTalent.sectionTag', e.target.value)}
              />
            </div>
            <div className="field-group half">
              <label>Title</label>
              <Input
                className="form-control"
                value={cmsData.dimensionsOfTalent.title}
                onChange={(e) => updateNestedField('dimensionsOfTalent.title', e.target.value)}
              />
            </div>
            <div className="field-group full" style={{ gridColumn: 'span 2' }}>
              <label>Expert Insight Callout</label>
              <textarea
                className="form-control"
                rows={2}
                value={cmsData.dimensionsOfTalent.expertInsight}
                onChange={(e) => updateNestedField('dimensionsOfTalent.expertInsight', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
            {cmsData.dimensionsOfTalent.dimensions.map((dim, idx) => (
              <div key={idx} style={{ border: '1px solid #e2edf8', borderRadius: 12, padding: 14, background: '#f8faff' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0066cc', marginBottom: 6 }}>
                  Dimension {dim.num}
                </div>
                <label style={{ fontSize: 11, color: '#6b7a99' }}>Title</label>
                <Input
                  className="form-control"
                  style={{ marginBottom: 6 }}
                  value={dim.title}
                  onChange={(e) => {
                    const dims = [...cmsData.dimensionsOfTalent.dimensions];
                    dims[idx].title = e.target.value;
                    updateNestedField('dimensionsOfTalent.dimensions', dims);
                  }}
                />
                <label style={{ fontSize: 11, color: '#6b7a99' }}>Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={dim.description}
                  onChange={(e) => {
                    const dims = [...cmsData.dimensionsOfTalent.dimensions];
                    dims[idx].description = e.target.value;
                    updateNestedField('dimensionsOfTalent.dimensions', dims);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: EDITORIAL & BLOG MATRIX */}
      {activeTab === 'blog' && (
        <div className="panel" style={{ padding: 24 }}>
          <div className="header" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a2540', margin: 0 }}>
              Editorial & Research Matrix Settings
            </h3>
            <span className="tag-blue">Articles & Market Trends</span>
          </div>

          <div className="fields" style={{ marginBottom: 20 }}>
            <div className="field-group half">
              <label>Section Tag</label>
              <Input
                className="form-control"
                value={cmsData.blogMatrix.sectionTag}
                onChange={(e) => updateNestedField('blogMatrix.sectionTag', e.target.value)}
              />
            </div>
            <div className="field-group half">
              <label>Headline Title</label>
              <Input
                className="form-control"
                value={cmsData.blogMatrix.title}
                onChange={(e) => updateNestedField('blogMatrix.title', e.target.value)}
              />
            </div>
          </div>

          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#06284f', marginBottom: 12 }}>
            Articles ({cmsData.blogMatrix.articles.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cmsData.blogMatrix.articles.map((art, idx) => (
              <div key={art.id} style={{ border: '1px solid #e2edf8', borderRadius: 12, padding: 16, background: '#f8faff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#063970' }}>
                    Article #{idx + 1} {art.featured ? '(★ Flagship Featured)' : ''}
                  </span>
                  <span className="tag-blue" style={{ fontSize: 11 }}>{art.category}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 11, color: '#6b7a99' }}>Title</label>
                    <Input
                      className="form-control"
                      value={art.title}
                      onChange={(e) => {
                        const arts = [...cmsData.blogMatrix.articles];
                        arts[idx].title = e.target.value;
                        updateNestedField('blogMatrix.articles', arts);
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 11, color: '#6b7a99' }}>Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={art.description}
                      onChange={(e) => {
                        const arts = [...cmsData.blogMatrix.articles];
                        arts[idx].description = e.target.value;
                        updateNestedField('blogMatrix.articles', arts);
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7a99' }}>Author</label>
                    <Input
                      className="form-control"
                      value={art.author}
                      onChange={(e) => {
                        const arts = [...cmsData.blogMatrix.articles];
                        arts[idx].author = e.target.value;
                        updateNestedField('blogMatrix.articles', arts);
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7a99' }}>Read Time</label>
                    <Input
                      className="form-control"
                      value={art.readTime}
                      onChange={(e) => {
                        const arts = [...cmsData.blogMatrix.articles];
                        arts[idx].readTime = e.target.value;
                        updateNestedField('blogMatrix.articles', arts);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: VIDEO SHOWCASE */}
      {activeTab === 'video' && (
        <div className="panel" style={{ padding: 24 }}>
          <div className="header" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a2540', margin: 0 }}>
              Video Showcase & Playlist Settings
            </h3>
            <span className="tag-blue">Interactive Video Hub</span>
          </div>

          <div className="fields" style={{ marginBottom: 20 }}>
            <div className="field-group half">
              <label>Section Tag</label>
              <Input
                className="form-control"
                value={cmsData.videoContent.sectionTag}
                onChange={(e) => updateNestedField('videoContent.sectionTag', e.target.value)}
              />
            </div>
            <div className="field-group half">
              <label>Main Title</label>
              <Input
                className="form-control"
                value={cmsData.videoContent.title}
                onChange={(e) => updateNestedField('videoContent.title', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cmsData.videoContent.videoList.map((vid, idx) => (
              <div key={vid.id} style={{ border: '1px solid #e2edf8', borderRadius: 12, padding: 16, background: '#f8faff' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#073b80', marginBottom: 8 }}>
                  Video #{idx + 1}: {vid.badge}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 11, color: '#6b7a99' }}>Video Title</label>
                    <Input
                      className="form-control"
                      value={vid.title}
                      onChange={(e) => {
                        const vids = [...cmsData.videoContent.videoList];
                        vids[idx].title = e.target.value;
                        updateNestedField('videoContent.videoList', vids);
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7a99' }}>Speaker</label>
                    <Input
                      className="form-control"
                      value={vid.speaker}
                      onChange={(e) => {
                        const vids = [...cmsData.videoContent.videoList];
                        vids[idx].speaker = e.target.value;
                        updateNestedField('videoContent.videoList', vids);
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7a99' }}>Duration</label>
                    <Input
                      className="form-control"
                      value={vid.duration}
                      onChange={(e) => {
                        const vids = [...cmsData.videoContent.videoList];
                        vids[idx].duration = e.target.value;
                        updateNestedField('videoContent.videoList', vids);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: WHY & TESTIMONIALS */}
      {activeTab === 'testimonials' && (
        <div className="panel" style={{ padding: 24 }}>
          <div className="header" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a2540', margin: 0 }}>
              Why LetGetIn & Testimonials Settings
            </h3>
            <span className="tag-blue">Social Proof & Comparison</span>
          </div>

          <div className="fields" style={{ marginBottom: 24 }}>
            <div className="field-group half">
              <label>Why Section Tag</label>
              <Input
                className="form-control"
                value={cmsData.whyAndTestimonials.whyTag}
                onChange={(e) => updateNestedField('whyAndTestimonials.whyTag', e.target.value)}
              />
            </div>
            <div className="field-group half">
              <label>Why Title</label>
              <Input
                className="form-control"
                value={cmsData.whyAndTestimonials.whyTitle}
                onChange={(e) => updateNestedField('whyAndTestimonials.whyTitle', e.target.value)}
              />
            </div>
            <div className="field-group full" style={{ gridColumn: 'span 2' }}>
              <label>Why Subtitle</label>
              <textarea
                className="form-control"
                rows={2}
                value={cmsData.whyAndTestimonials.whySubtitle}
                onChange={(e) => updateNestedField('whyAndTestimonials.whySubtitle', e.target.value)}
              />
            </div>
          </div>

          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#06284f', marginBottom: 12 }}>
            Testimonials ({cmsData.whyAndTestimonials.testimonialsList.length})
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
            {cmsData.whyAndTestimonials.testimonialsList.map((t, idx) => (
              <div key={idx} style={{ border: '1px solid #e2edf8', borderRadius: 12, padding: 14, background: '#f8faff' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#06284f', marginBottom: 8 }}>
                  Testimonial #{idx + 1} ({t.initials})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7a99' }}>Quote</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={t.quote}
                      onChange={(e) => {
                        const list = [...cmsData.whyAndTestimonials.testimonialsList];
                        list[idx].quote = e.target.value;
                        updateNestedField('whyAndTestimonials.testimonialsList', list);
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7a99' }}>Author Name</label>
                    <Input
                      className="form-control"
                      value={t.author}
                      onChange={(e) => {
                        const list = [...cmsData.whyAndTestimonials.testimonialsList];
                        list[idx].author = e.target.value;
                        updateNestedField('whyAndTestimonials.testimonialsList', list);
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7a99' }}>Role / Company</label>
                    <Input
                      className="form-control"
                      value={t.role}
                      onChange={(e) => {
                        const list = [...cmsData.whyAndTestimonials.testimonialsList];
                        list[idx].role = e.target.value;
                        updateNestedField('whyAndTestimonials.testimonialsList', list);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: CTA & FOOTER */}
      {activeTab === 'cta-footer' && (
        <div className="panel" style={{ padding: 24 }}>
          <div className="header" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a2540', margin: 0 }}>
              Final CTA, Navbar & Footer Settings
            </h3>
            <span className="tag-blue">Headers, Footers & Action Banners</span>
          </div>

          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#06284f', marginBottom: 12 }}>
            Final CTA Banner
          </h4>
          <div className="fields" style={{ marginBottom: 24 }}>
            <div className="field-group half">
              <label>CTA Badge</label>
              <Input
                className="form-control"
                value={cmsData.finalCTA.badge}
                onChange={(e) => updateNestedField('finalCTA.badge', e.target.value)}
              />
            </div>
            <div className="field-group half">
              <label>CTA Headline</label>
              <Input
                className="form-control"
                value={cmsData.finalCTA.headline}
                onChange={(e) => updateNestedField('finalCTA.headline', e.target.value)}
              />
            </div>
            <div className="field-group full" style={{ gridColumn: 'span 2' }}>
              <label>CTA Subtitle</label>
              <textarea
                className="form-control"
                rows={2}
                value={cmsData.finalCTA.subtitle}
                onChange={(e) => updateNestedField('finalCTA.subtitle', e.target.value)}
              />
            </div>
            <div className="field-group half">
              <label>Primary Button Text</label>
              <Input
                className="form-control"
                value={cmsData.finalCTA.primaryButtonText}
                onChange={(e) => updateNestedField('finalCTA.primaryButtonText', e.target.value)}
              />
            </div>
            <div className="field-group half">
              <label>Secondary Button Text</label>
              <Input
                className="form-control"
                value={cmsData.finalCTA.secondaryButtonText}
                onChange={(e) => updateNestedField('finalCTA.secondaryButtonText', e.target.value)}
              />
            </div>
          </div>

          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#06284f', marginBottom: 12 }}>
            Navbar & Footer Branding
          </h4>
          <div className="fields">
            <div className="field-group half">
              <label>Navbar Brand Name</label>
              <Input
                className="form-control"
                value={cmsData.navbar.brandName}
                onChange={(e) => updateNestedField('navbar.brandName', e.target.value)}
              />
            </div>
            <div className="field-group half">
              <label>Navbar Beta Badge</label>
              <Input
                className="form-control"
                value={cmsData.navbar.badge}
                onChange={(e) => updateNestedField('navbar.badge', e.target.value)}
              />
            </div>
            <div className="field-group full" style={{ gridColumn: 'span 2' }}>
              <label>Footer Description</label>
              <Input
                className="form-control"
                value={cmsData.footer.brandDescription}
                onChange={(e) => updateNestedField('footer.brandDescription', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: SECTION VISIBILITY TOGGLES */}
      {activeTab === 'visibility' && (
        <div className="panel" style={{ padding: 24 }}>
          <div className="header" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a2540', margin: 0 }}>
              Section Visibility & Display Controls
            </h3>
            <span className="tag-blue">Toggle Sections On / Off</span>
          </div>

          <p style={{ color: '#6b7a99', fontSize: 13, marginBottom: 20 }}>
            Enable or disable specific landing page sections dynamically without code deployments.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { key: 'hero', label: '1. Hero Section', icon: 'fa-star' },
              { key: 'cinematicShowcase', label: '2. Cinematic Video Showcase', icon: 'fa-play' },
              { key: 'statsAndShift', label: '3. Stats & The Shift', icon: 'fa-chart-pie' },
              { key: 'coreFeatures', label: '4. Core Platform Features OS', icon: 'fa-cube' },
              { key: 'dimensions', label: '5. The 6 Dimensions of Talent', icon: 'fa-shapes' },
              { key: 'blogMatrix', label: '6. Editorial & Research Matrix', icon: 'fa-book' },
              { key: 'videoHub', label: '7. Video Showcase Hub', icon: 'fa-video' },
              { key: 'whyAndTestimonials', label: '8. Why LetGetIn & Testimonials', icon: 'fa-quote-left' },
              { key: 'finalCTA', label: '9. Final CTA Banner', icon: 'fa-flag' },
            ].map((sec) => {
              const isVisible = (cmsData.sectionVisibility as any)[sec.key];
              return (
                <div
                  key={sec.key}
                  style={{
                    border: '1px solid #e2edf8',
                    borderRadius: 12,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isVisible ? '#f8faff' : '#fcfcfd',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className={`fas ${sec.icon}`} style={{ color: isVisible ? '#2563eb' : '#94a3b8' }} />
                    <span style={{ fontWeight: 600, fontSize: 13, color: isVisible ? '#1a2540' : '#94a3b8' }}>
                      {sec.label}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateNestedField(`sectionVisibility.${sec.key}`, !isVisible)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: 20,
                      border: 'none',
                      background: isVisible ? '#2563eb' : '#e2e8f0',
                      color: isVisible ? '#fff' : '#64748b',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isVisible ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CmsPage;
