export default function SearchBar({ search, setSearch }) {
  return (
    <input
      type="text"
      placeholder="Search employees..."
      className="w-full max-w-md p-2 rounded-lg bg-slate-100"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}