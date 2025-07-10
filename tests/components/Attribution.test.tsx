import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Attribution from '../../src/components/Attribution';

describe('Attribution Component', () => {
  describe('when the attribution area is rendered', () => {
    it('should display the creator name', () => {
      render(<Attribution />);
      
      expect(screen.getByText(/Created by/)).toBeInTheDocument();
      expect(screen.getByText(/Iftach Yakar/)).toBeInTheDocument();
    });

    it('should provide social media links with proper accessibility', () => {
      render(<Attribution />);
      
      const xTwitterLink = screen.getByLabelText('X (Twitter) profile');
      const blueskyLink = screen.getByLabelText('Bluesky profile');
      const githubLink = screen.getByLabelText('GitHub profile');
      const linkedinLink = screen.getByLabelText('LinkedIn profile');
      
      expect(xTwitterLink).toBeInTheDocument();
      expect(blueskyLink).toBeInTheDocument();
      expect(githubLink).toBeInTheDocument();
      expect(linkedinLink).toBeInTheDocument();
      
      expect(xTwitterLink).toHaveAttribute('href', 'https://x.com/QuantumYakar');
      expect(blueskyLink).toHaveAttribute('href', 'https://bsky.app/profile/quantumyakar.bsky.social');
      expect(githubLink).toHaveAttribute('href', 'https://github.com/DeDuckProject');
      expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/iftach-yakar-1511b344/');
    });

    it('should open social media links in new tabs for security', () => {
      render(<Attribution />);
      
      const socialLinks = screen.getAllByRole('link');
      
      socialLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should have the correct CSS classes for styling', () => {
      render(<Attribution />);
      
      const container = screen.getByText(/Created by/).closest('.attribution-container');
      const linksContainer = screen.getByLabelText('GitHub profile').closest('.attribution-links');
      const firstLink = screen.getByLabelText('GitHub profile');
      
      expect(container).toHaveClass('attribution-container');
      expect(linksContainer).toHaveClass('attribution-links');
      expect(firstLink).toHaveClass('attribution-link');
    });

    it('should display the repository section', () => {
      render(<Attribution />);
      
      expect(screen.getByText('Open Source Project')).toBeInTheDocument();
      expect(screen.getByText('View on GitHub')).toBeInTheDocument();
      
      const repoLink = screen.getByLabelText('View source code on GitHub');
      expect(repoLink).toBeInTheDocument();
      expect(repoLink).toHaveAttribute('href', 'https://github.com/DeDuckProject/epp-demo');
      expect(repoLink).toHaveClass('repository-link');
    });

    it('should style the repository section correctly', () => {
      render(<Attribution />);
      
      const repoSection = screen.getByText('Open Source Project').closest('.repository-section');
      const repoText = screen.getByText('Open Source Project');
      const repoLink = screen.getByLabelText('View source code on GitHub');
      
      expect(repoSection).toHaveClass('repository-section');
      expect(repoText).toHaveClass('repository-text');
      expect(repoLink).toHaveClass('repository-link');
    });
  });

  describe('when users interact with the attribution', () => {
    it('should maintain proper tab order for keyboard navigation', () => {
      render(<Attribution />);
      
      const links = screen.getAllByRole('link');
      
      // All links should be focusable
      links.forEach(link => {
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should provide meaningful aria labels for screen readers', () => {
      render(<Attribution />);
      
      expect(screen.getByLabelText('GitHub profile')).toBeInTheDocument();
      expect(screen.getByLabelText('LinkedIn profile')).toBeInTheDocument();
      expect(screen.getByLabelText('X (Twitter) profile')).toBeInTheDocument();
      expect(screen.getByLabelText('Bluesky profile')).toBeInTheDocument();
      expect(screen.getByLabelText('View source code on GitHub')).toBeInTheDocument();
    });
  });

  describe('when the component tells its story', () => {
    it('should communicate the creator attribution clearly', () => {
      render(<Attribution />);
      
      // The story: A user sees the app and wants to know who created it
      const creatorText = screen.getByText(/Created by/);
      const creatorName = screen.getByText(/Iftach Yakar/);
      
      expect(creatorText).toBeVisible();
      expect(creatorName).toBeVisible();
      
      // The story continues: They want to connect with the creator
      const socialLinks = screen.getAllByRole('link');
      expect(socialLinks).toHaveLength(5); // Updated to include repository link
      
      // The story concludes: They can easily access the creator's profiles and the source code
      socialLinks.forEach(link => {
        expect(link).toBeVisible();
        expect(link.getAttribute('href')).toMatch(/^https:\/\//);
      });

      // And they can find the open source repository
      const repoText = screen.getByText('Open Source Project');
      const repoLink = screen.getByLabelText('View source code on GitHub');
      expect(repoText).toBeVisible();
      expect(repoLink).toBeVisible();
      expect(repoLink.getAttribute('href')).toBe('https://github.com/DeDuckProject/epp-demo');
    });
  });
}); 