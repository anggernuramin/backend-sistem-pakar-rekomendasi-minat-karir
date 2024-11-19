export const formatDate = (dateObj: Date) => {
  if (!dateObj) return
  const day = String(dateObj.getDate()).padStart(2, '0')
  const month = String(dateObj.getMonth() + 1).padStart(2, '0') // bulan mulai dari 0
  const year = dateObj.getFullYear()
  return `${day}-${month}-${year}`
}

export const formatTime = (dateObj: Date) => {
  if (!dateObj) return
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  const seconds = String(dateObj.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}
