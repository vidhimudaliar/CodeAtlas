import classes from './StatsGroup.module.css';
import { Text } from '@mantine/core';

interface StatsGroupProps {
    pageViews: number;
    newUsers: number;
    completedOrders: number;
  }
  
  export function StatsGroup({ pageViews, newUsers, completedOrders }: StatsGroupProps) {
    const data = [
      {
        title: 'Page views',
        stats: pageViews.toLocaleString(), // format numbers 
        description: '24% more than in the same month last year, 33% more than two years ago',
      },
      {
        title: 'New users',
        stats: newUsers.toLocaleString(),
        description: '13% less compared to last month, new user engagement up by 6%',
      },
      {
        title: 'Completed orders',
        stats: completedOrders.toLocaleString(),
        description: 'Orders completed this month, 97% satisfaction rate',
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

  //exmaple usage: 
  // <StatsGroup pageViews={456133} newUsers={2175} completedOrders={1994} />
  