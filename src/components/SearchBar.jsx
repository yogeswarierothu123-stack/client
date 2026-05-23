function SearchBar({ onSearch }) {
  return (
    <input
      type="text"
      onChange={(e) => onSearch?.(e.target.value)}
    />
  )
}

export default SearchBar;