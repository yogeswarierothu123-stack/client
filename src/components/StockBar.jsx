function StockBar({ remaining, total }) {
  const percentage = (remaining / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-bold">Stock Remaining</span>
        <span className="text-red-400">{percentage.toFixed(0)}%</span>
      </div>
      <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-neutral-400">
        {remaining} of {total} units left
      </div>
    </div>
  )
}

export default StockBar
