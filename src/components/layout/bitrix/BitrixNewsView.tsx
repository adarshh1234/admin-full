import type { NewsArticle } from '../../../types/panel';

interface BitrixNewsViewProps {
  articles: NewsArticle[];
}

export function BitrixNewsView({ articles }: BitrixNewsViewProps) {
  return (
    <div className="bitrix-content-view">
      <div className="bitrix-view-header">
        <div className="bitrix-view-title-wrap">
          <span className="bitrix-view-badge news-badge">
            <i className="fas fa-newspaper" />
          </span>
          <div>
            <h2>Company News &amp; Bulletin</h2>
            <p>Official company announcements, updates, and ERP releases</p>
          </div>
        </div>
      </div>

      <div className="bitrix-news-grid">
        {articles.map((art) => (
          <article key={art.id} className="bitrix-news-card">
            <div className="bitrix-news-meta">
              <span className="bitrix-news-tag">{art.tag}</span>
              <span className="bitrix-news-date">{art.date}</span>
            </div>
            <h3>{art.title}</h3>
            <p>{art.content}</p>
            <div className="bitrix-news-footer">
              <i className="fas fa-user-circle" />
              <span>By {art.author}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
