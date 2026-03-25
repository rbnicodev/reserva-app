import type { BoardEntry } from "../models/BoardEntry";

export default function BoardEntryComponent(entry: BoardEntry) {
    return (
        <div>
            <div className="card shadow-sm p-3 d-flex flex-row align-items-center">
                <div className={`flex-grow-1 ${entry.urlImage ? 'me-3' : ''}`}>
                    <h5 className="card-title text-dark mb-3 text-center">{entry.title}</h5>
                    <h6 className="card-subtitle mb-2 text-muted text-center">{entry.subtitle}</h6>
                    <p className="card-text mt-3 text-start text-break">
                        {entry.content.split("\\n").map((line, index) => (
                            <span key={index}>
                                {line}
                                <br />
                            </span>
                        ))}
                    </p>
                    {!!entry.footer && (
                        <p className="card-text text-secondary">{entry.footer}</p>
                    )}
                    <p className="card-text text-secondary text-center fs-6 pt-3">{entry.order.toDate().toLocaleDateString()}</p>
                </div>
                {entry.urlImage && (
                    <div style={{ width: '20%' }}>
                        <img
                            src={entry.urlImage}
                            alt="entry visual"
                            className="img-fluid rounded"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
