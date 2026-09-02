import { ALL_MODULES } from '../../../data/modulesData';
import { Button } from '../../common/Button';

interface BitrixFavoritesViewProps {
  favoritesList: number[];
  onToggleFavorite: (id: number) => void;
  onNavigateModule: (id: number) => void;
}

export function BitrixFavoritesView({
  favoritesList,
  onToggleFavorite,
  onNavigateModule,
}: BitrixFavoritesViewProps) {
  const favoriteModules = ALL_MODULES.filter((m) => favoritesList.includes(m.id));

  return (
    <div className="bitrix-content-view">
      <div className="bitrix-view-header">
        <div className="bitrix-view-title-wrap">
          <span className="bitrix-view-badge star-badge">
            <i className="fas fa-star" />
          </span>
          <div>
            <h2>Favorites &amp; Pinned Shortcuts</h2>
            <p>Your starred ERP modules for quick 1-click execution</p>
          </div>
        </div>
      </div>

      <div className="bitrix-favorites-grid">
        {favoriteModules.map((mod) => (
          <div key={mod.id} className="bitrix-favorite-card">
            <div className="bitrix-fav-icon">
              <i className={`fas ${mod.icon || 'fa-cube'}`} />
            </div>
            <div className="bitrix-fav-details">
              <h4>{mod.name}</h4>
              <span>{mod.category}</span>
            </div>
            <div className="bitrix-fav-actions">
              <Button
                type="button"
                className="bitrix-launch-btn"
                onClick={() => onNavigateModule(mod.id)}
              >
                Launch
              </Button>
              <Button
                type="button"
                className="bitrix-star-remove"
                onClick={() => onToggleFavorite(mod.id)}
                title="Remove from favorites"
              >
                <i className="fas fa-star" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

