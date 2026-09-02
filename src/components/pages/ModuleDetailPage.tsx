import { useState } from 'react';
import type { ModuleDetailFields, ModuleItem } from '../../types/module';
import { useToast } from '../../hooks/useToast';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface ModuleDetailPageProps {
  module: ModuleItem;
}

function getDefaultModuleFields(module: ModuleItem): ModuleDetailFields {
  return {
    name: module.name,
    category: module.category,
    status: 'Active',
    description: `This is the ${module.name} module. It handles all aspects of ${module.category} related operations.`,
    owner: 'labeeb.eee_candidate',
    lastUpdated: 'Today',
  };
}

export function ModuleDetailPage({ module }: ModuleDetailPageProps) {
  const { showToast } = useToast();
  const [fields, setFields] = useState<ModuleDetailFields>(() => getDefaultModuleFields(module));

  function handleChange(field: keyof ModuleDetailFields, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    showToast(`Saved changes for ${fields.name}`, 'success');
  }

  function handleReset() {
    setFields(getDefaultModuleFields(module));
    showToast(`Reset changes for ${module.name}`, 'info');
  }

  function handleDelete() {
    showToast(`Module "${fields.name}" cannot be deleted in demo mode.`, 'error');
  }


  return (
    <div className="panel module-detail" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="header">
        <div className="icon-lg">
          <i className={`fas ${module.icon || 'fa-cube'}`} />
        </div>
        <h2>{fields.name}</h2>
        <span className="tag-blue" style={{ marginLeft: 'auto', fontSize: 12 }}>
          {fields.category}
        </span>
      </div>

      <div className="fields">
        <div className="field-group half">
          <label>Module Name</label>
          <Input
            className="form-control"
            value={fields.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div className="field-group half">
          <label>Category</label>
          <Input
            className="form-control"
            value={fields.category}
            onChange={(e) => handleChange('category', e.target.value)}
          />
        </div>

        <div className="field-group half">
          <label>Status</label>
          <select
            className="form-control"
            value={fields.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option>Active</option>
            <option>Inactive</option>
            <option>Pending Setup</option>
          </select>
        </div>

        <div className="field-group half">
          <label>Owner</label>
          <Input
            className="form-control"
            value={fields.owner}
            onChange={(e) => handleChange('owner', e.target.value)}
          />
        </div>

        <div className="field-group half">
          <label>Last Updated</label>
          <div className="form-control" style={{ background: '#f8faff' }}>
            {fields.lastUpdated}
          </div>
        </div>

        <div className="field-group half">
          <label>Description</label>
          <textarea
            className="form-control"
            value={fields.description}
            rows={2}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={handleSave}>
          <i className="fas fa-save" /> Save Changes
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <i className="fas fa-history" /> Reset
        </Button>
        <Button
          variant="outline"
          style={{ color: '#ef4444', borderColor: '#ef4444' }}
          onClick={handleDelete}
        >
          <i className="fas fa-trash-alt" /> Delete
        </Button>
      </div>
    </div>
  );
}
