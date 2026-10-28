import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import api, { getErrorMessage } from '../../api/axios.js'

export default function Reports() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [busyReport, setBusyReport] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await api.get('/classes')
        setClasses(res.data)
        if (res.data.length > 0) setSelectedClass(String(res.data[0].id))
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load classes from the server.'))
      }
    }
    loadClasses()
  }, [])

  const downloadCSV = (filename, rows) => {
    const csvData = rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', filename)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const entryToRow = (e, includeClass) => {
    const base = [e.day, `Period ${e.period?.periodNumber ?? ''}`, e.subject?.name, e.teacher?.name, e.room?.roomNumber]
    return includeClass ? [e.schoolClass?.className, ...base] : base
  }

  const runReport = async (key, fn) => {
    setBusyReport(key)
    setError('')
    try {
      await fn()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not generate this report.'))
    } finally {
      setBusyReport(null)
    }
  }

  const handleDownloadAllClasses = () => runReport('all-classes', async () => {
    const rows = [['Class', 'Day', 'Period', 'Subject', 'Teacher', 'Room']]
    for (const c of classes) {
      const res = await api.get(`/reports/class/${c.id}`)
      res.data.forEach(e => rows.push(entryToRow(e, true)))
    }
    downloadCSV('Timetable_Report_All_Classes.csv', rows)
  })

  const handleDownloadAllTeachers = () => runReport('all-teachers', async () => {
    const teachersRes = await api.get('/teachers')
    const rows = [['Teacher', 'Total Periods', 'Classes Taught', 'Subjects']]
    for (const t of teachersRes.data) {
      const res = await api.get(`/reports/teacher/${t.id}`)
      const entries = res.data
      const classesTaught = Array.from(new Set(entries.map(e => e.schoolClass?.className).filter(Boolean))).join('; ')
      const subjectsTaught = Array.from(new Set(entries.map(e => e.subject?.name).filter(Boolean))).join('; ')
      rows.push([t.name, entries.length, classesTaught, subjectsTaught])
    }
    downloadCSV('Teacher_Timetable_Report_All.csv', rows)
  })

  const handleDownloadSelectedClass = () => runReport('selected-class', async () => {
    if (!selectedClass) return
    const res = await api.get(`/reports/class/${selectedClass}`)
    const className = classes.find(c => String(c.id) === selectedClass)?.className ?? selectedClass
    const rows = [['Day', 'Period', 'Subject', 'Teacher', 'Room'], ...res.data.map(e => entryToRow(e, false))]
    downloadCSV(`Class_Timetable_Report_${className}.csv`, rows)
  })

  const handleDownloadRoomUtilization = () => runReport('room-utilization', async () => {
    const [roomsRes] = await Promise.all([api.get('/rooms')])
    const usageCount = {}
    for (const c of classes) {
      const res = await api.get(`/reports/class/${c.id}`)
      res.data.forEach(e => {
        const roomNo = e.room?.roomNumber
        if (roomNo) usageCount[roomNo] = (usageCount[roomNo] || 0) + 1
      })
    }
    const rows = [['Room', 'Type', 'Capacity', 'Periods Used (Published)']]
    roomsRes.data.forEach(r => rows.push([r.roomNumber, r.type, r.capacity, usageCount[r.roomNumber] || 0]))
    downloadCSV('Room_Utilization_Report.csv', rows)
  })

  const selectedClassName = classes.find(c => String(c.id) === selectedClass)?.className

  const reports = [
    {
      key: 'all-classes',
      title: '1. Timetable Report – All Classes',
      desc: 'A comprehensive export of the published timetable spanning every class in the school.',
      handler: handleDownloadAllClasses,
    },
    {
      key: 'all-teachers',
      title: '2. Teacher Timetable Report – All Teachers',
      desc: 'Workload and scheduling details for all teaching staff, based on published timetable data.',
      handler: handleDownloadAllTeachers,
    },
    {
      key: 'selected-class',
      title: `3. Class Timetable Report – ${selectedClassName ?? 'Selected Class'}`,
      desc: 'Daily schedule export for the class chosen below.',
      handler: handleDownloadSelectedClass,
      showClassPicker: true,
    },
    {
      key: 'room-utilization',
      title: '4. Room Utilization Report – All Rooms',
      desc: 'How many published periods each room is used for, across all classes.',
      handler: handleDownloadRoomUtilization,
    },
  ]

  return (
    <Layout title="System Reports">
      <div className="card">
        <h3>Available Exports</h3>
        <p style={{ margin: '10px 0 20px 0', color: '#666' }}>
          Click to download the latest data from the database in CSV format.
        </p>

        {error && <div className="error-alert">{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {reports.map((report) => (
            <div key={report.key} style={{
              padding: '15px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>{report.title}</h4>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{report.desc}</div>
                {report.showClassPicker && (
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    style={{ marginTop: 8, padding: '6px', borderRadius: '4px' }}
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.className}</option>
                    ))}
                  </select>
                )}
              </div>
              <button className="btn primary" onClick={report.handler} disabled={busyReport === report.key}>
                {busyReport === report.key ? 'Preparing...' : '⬇️ Download CSV'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
