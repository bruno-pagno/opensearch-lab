import UnassignedReplicasLab from './labs/UnassignedReplicasLab'

export default function LabDetail() {
  const slug = window.location.pathname.replace('/labs/', '')
  if (slug === 'unassigned-replicas') return <UnassignedReplicasLab />
  return (
    <div className="min-h-screen bg-air-bg flex items-center justify-center text-foggy">
      Lab not found: {slug}
    </div>
  )
}
