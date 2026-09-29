import { Clock, FolderOpen, X } from 'lucide-react';
import { typeLabel } from '../lib/fileTypes';
import { formatBytes, timeAgo } from '../lib/format';
import { isNativeApp } from '../lib/native';
import type { RecentFile } from '../lib/recents';
import { FileIcon } from './FileIcon';

interface Props {
  recents: RecentFile[];
  onOpenPicker(): void;
  onOpenRecent(file: RecentFile): void;
  onRemoveRecent(file: RecentFile): void;
  onClearRecents(): void;
}

export default function HomeScreen({ recents, onOpenPicker, onOpenRecent, onRemoveRecent, onClearRecents }: Props) {
  return (
    <div className="home">
      <header className="home-header">
        <img src="./favicon.svg" alt="" width={32} height={32} />
        <h1>File Viewer</h1>
      </header>

      <div className="home-body">
        <button className="open-card" onClick={onOpenPicker}>
          <span className="open-card-icon">
            <FolderOpen size={26} />
          </span>
          <span className="open-card-text">
            <strong>Open a document</strong>
            <span>PDF, Excel (xlsx, xls, ods) or CSV</span>
          </span>
        </button>

        <section className="recents">
          <div className="section-head">
            <h2>Recent</h2>
            {recents.length > 0 && (
              <button className="text-btn" onClick={onClearRecents}>
                Clear
              </button>
            )}
          </div>

          {recents.length === 0 ? (
            <div className="empty-recents">
              <Clock size={28} />
              <p>Files you open will show up here.</p>
            </div>
          ) : (
            <ul className="recent-list">
              {recents.map((file) => (
                <li key={file.id}>
                  <button className="recent-item" onClick={() => onOpenRecent(file)}>
                    <FileIcon kind={file.kind} />
                    <span className="recent-text">
                      <span className="recent-name">{file.name}</span>
                      <span className="recent-meta">
                        {typeLabel(file.name, file.kind)} · {formatBytes(file.size)} · {timeAgo(file.openedAt)}
                      </span>
                    </span>
                  </button>
                  <button className="icon-btn subtle" onClick={() => onRemoveRecent(file)} aria-label={`Remove ${file.name} from recent`}>
                    <X size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {isNativeApp && (
          <p className="tip">
            <strong>Tip:</strong> open any PDF, Excel or CSV file from your file manager, WhatsApp, Gmail or Downloads
            and choose <strong>File Viewer</strong>. Pick <strong>Always</strong> to make it your default app for that
            file type.
          </p>
        )}
      </div>
    </div>
  );
}
