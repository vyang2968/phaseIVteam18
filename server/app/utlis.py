def format_timedelta(td):
  # Convert timedelta to seconds or a formatted string
  # Options:
  # 1. Total seconds as integer: return int(td.total_seconds())
  # 2. Hours:Minutes:Seconds format
  hours, remainder = divmod(td.seconds, 3600)
  minutes, seconds = divmod(remainder, 60)
  return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
