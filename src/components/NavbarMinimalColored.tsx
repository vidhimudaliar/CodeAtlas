"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  IconCalendarStats,
  IconDeviceDesktopAnalytics,
  IconFingerprint,
  IconGauge,
  IconHome2,
  IconLogout,
  IconSettings,
  IconSwitchHorizontal,
  IconUser,
} from '@tabler/icons-react';
import { Stack, Tooltip, UnstyledButton } from '@mantine/core';
import classes from './NavbarMinimalColored.module.css';

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}

function NavbarLink({ icon: Icon, label, active, onClick, href }: NavbarLinkProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (href) {
      router.push(href);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton onClick={handleClick} className={classes.link} data-active={active || undefined}>
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  { icon: IconHome2, label: 'Home', href: '/' },
  { icon: IconGauge, label: 'Dashboard', href: '/dashboard' },
  { icon: IconDeviceDesktopAnalytics, label: 'Analytics', href: '/analytics' },
  { icon: IconCalendarStats, label: 'Releases', href: '/releases' },
  { icon: IconUser, label: 'Account', href: '/account' },
  { icon: IconFingerprint, label: 'Security', href: '/security' },
  { icon: IconSettings, label: 'Settings', href: '/settings' },
];

export function NavbarMinimalColored() {
  const pathname = usePathname();

  // Set active based on current path
  const getActiveIndex = () => {
    const currentPath = pathname;
    const index = mockdata.findIndex(link => link.href === currentPath);
    return index >= 0 ? index : 0;
  };

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === getActiveIndex()}
    />
  ));

  return (
    <nav className={classes.navbar}>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <NavbarLink icon={IconSwitchHorizontal} label="Change account" />
        <NavbarLink icon={IconLogout} label="Logout" />
      </Stack>
    </nav>
  );
}