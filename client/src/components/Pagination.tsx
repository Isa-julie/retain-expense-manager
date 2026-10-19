interface Props {
  page: number;
  pages: number;
  total: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, pages, total, onChange }: Props) {
  return (
    <nav className="pagination" aria-label="Pages">
      <span>{total} expense{total === 1 ? '' : 's'}</span>
      <div>
        <button className="btn btn-quiet" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
        <span className="page-count">Page {page} of {pages}</span>
        <button className="btn btn-quiet" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </nav>
  );
}
