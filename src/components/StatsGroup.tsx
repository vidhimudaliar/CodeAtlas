import classes from './StatsGroup.module.css';

interface StatsGroupProps {
  tasksDone: number;
  tasksAssigned: number;
  numberCommits: number;
}

export function StatsGroup({ tasksDone, tasksAssigned, numberCommits }: StatsGroupProps) {
  // calculate dynamic metrics
  const progressPercentage = tasksAssigned ? Math.round((tasksDone / tasksAssigned) * 100) : 0;
  const efficiency = numberCommits ? (tasksDone / numberCommits).toFixed(1) : '0';

  const data = [
    {
      title: 'Progress',
      stats: `${progressPercentage}%`,
      description: `Completed ${tasksDone.toLocaleString()} tasks out of ${tasksAssigned.toLocaleString()}.`,
    },
    {
      title: 'Efficiency',
      stats: efficiency,
      description: `Each commit completed an average of ${efficiency} tasks.`,
    },
    {
      title: 'Total Commits',
      stats: numberCommits.toLocaleString(),
      description: `Total commits done this month.`,
    },
  ];

  const stats = data.map((stat) => (
    <div key={stat.title} className={classes.stat}>
      <div className={classes.count}>{stat.stats}</div>
      <div className={classes.title}>{stat.title}</div>
      <div className={classes.description}>{stat.description}</div>
    </div>
  ));

  return <div className={classes.root}>{stats}</div>;
}

// Example usage:
// <StatsGroup tasksDone={150} tasksAssigned={200} numberCommits={50} />
