"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
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
  icon?: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  isLogo?: boolean;
  svgIcon?: string;
}

function NavbarLink({ icon: Icon, label, active, onClick, href, isLogo = false, svgIcon }: NavbarLinkProps) {
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
    <Tooltip
      label={label}
      position="right"
      transitionProps={{ duration: 0 }}
      withArrow
      offset={8}
      styles={{
        tooltip: {
          fontSize: '16px',
          fontWeight: '600',
          padding: '10px 16px',
          backgroundColor: '#495B69',
          color: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 10000,
        },
        arrow: {
          borderColor: '#495B69',
        }
      }}
    >
      <UnstyledButton onClick={handleClick} className={classes.link} data-active={active || undefined}>
        {isLogo ? (
          <Image src="/bluelogo.png" alt="logo" width={32} height={32} />
        ) : svgIcon ? (
          <Image src={svgIcon} alt={label} width={32} height={32} />
        ) : (
          Icon && <Icon size={28} stroke={1.5} />
        )}
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  // { label: 'Home', href: '/', isLogo: true },

  // { icon: IconDeviceDesktopAnalytics, label: 'Analytics', href: '/analytics' },
  // { icon: IconCalendarStats, label: 'Releases', href: '/releases' },
  { svgIcon: '/profile-icon.svg', label: 'Profile', href: '/profile' },
  { svgIcon: '/dashboard-icon.svg', label: 'Dashboard', href: '/dashboard' },
  { svgIcon: '/projects-icon.svg', label: 'Projects', href: '/projects' },
  { svgIcon: '/contributions-icon.svg', label: 'Contributions', href: '/contributions' },
];

export function NavbarMinimalColored() {
  const router = useRouter();
  const pathname = usePathname();

  // Set active based on current path
  const getActiveIndex = () => {
    const currentPath = pathname;
    const index = mockdata.findIndex(link => link.href === currentPath);
    return index >= 0 ? index : 0;
  };

  const mainLinks = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === getActiveIndex()}
    />
  ));

  return (
    <nav className={classes.navbar}>
      {/* Logo at the top */}
      <div className={classes.logoSection}>
        <div className={classes.logoButton}>
          <Image src="/bluelogo.png" alt="CodeAtlas Logo" width={48} height={48} />
        </div>
      </div>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={32}>
          {mainLinks}
        </Stack>
      </div>

      <div className={classes.navbarBottom}>
        <Stack justify="center" gap={32}>
          {/* <NavbarLink icon={IconSwitchHorizontal} label="Change account" /> */}
          <NavbarLink icon={IconLogout} label="Logout" />
        </Stack>
      </div>
    </nav>
  );
}