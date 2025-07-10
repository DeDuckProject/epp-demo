import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiBluesky } from 'react-icons/si';

const Attribution: React.FC = () => {
  return (
    <div className="attribution-container">
      <div className="attribution-text">
        Created by
        <br />
        Iftach Yakar
      </div>
      <div className="attribution-links">
        <a
          href="https://x.com/QuantumYakar"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter) profile"
          className="attribution-link"
        >
          <FaXTwitter />
        </a>
        <a
          href="https://bsky.app/profile/quantumyakar.bsky.social"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bluesky profile"
          className="attribution-link"
        >
          <SiBluesky />
        </a>
        <a
            href="https://github.com/DeDuckProject"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="attribution-link"
        >
          <FaGithub />
        </a>
        <a
            href="https://www.linkedin.com/in/iftach-yakar-1511b344/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className="attribution-link"
        >
          <FaLinkedin />
        </a>
      </div>
      
      <div className="repository-section">
        <div className="repository-text">
          Open Source Project
        </div>
        <a
          href="https://github.com/DeDuckProject/epp-demo"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source code on GitHub"
          className="repository-link"
        >
          <FaGithub />
          <span>View on GitHub</span>
        </a>
      </div>
    </div>
  );
};

export default Attribution; 