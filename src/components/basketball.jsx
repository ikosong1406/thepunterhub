import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const BaseballWidget = ({
  apiKey = 'bb0c0a7ec514c13e30d2bc13fe3750c1',
  date = '',
  league = '',
  season = '',
  theme = '',
  refresh = 15,
  showToolbar = true,
  showErrors = false,
  showLogos = false,
  modalGame = true,
  modalStandings = true,
  modalShowLogos = true
}) => {
  const widgetContainerRef = useRef(null);

  useEffect(() => {
    // Create the widget div if it doesn't exist
    let widgetDiv = document.getElementById('wg-api-baseball-games');
    
    if (!widgetDiv) {
      widgetDiv = document.createElement('div');
      widgetDiv.id = 'wg-api-baseball-games';
      
      // Set all the data attributes
      widgetDiv.setAttribute('data-host', 'v1.baseball.api-sports.io');
      widgetDiv.setAttribute('data-key', apiKey);
      widgetDiv.setAttribute('data-date', date);
      widgetDiv.setAttribute('data-league', league);
      widgetDiv.setAttribute('data-season', season);
      widgetDiv.setAttribute('data-theme', theme);
      widgetDiv.setAttribute('data-refresh', refresh.toString());
      widgetDiv.setAttribute('data-show-toolbar', showToolbar.toString());
      widgetDiv.setAttribute('data-show-errors', showErrors.toString());
      widgetDiv.setAttribute('data-show-logos', showLogos.toString());
      widgetDiv.setAttribute('data-modal-game', modalGame.toString());
      widgetDiv.setAttribute('data-modal-standings', modalStandings.toString());
      widgetDiv.setAttribute('data-modal-show-logos', modalShowLogos.toString());

      // Append to our container
      if (widgetContainerRef.current) {
        widgetContainerRef.current.appendChild(widgetDiv);
      }
    }

    // Load the script
    const script = document.createElement('script');
    script.src = 'https://widgets.api-sports.io/2.0.3/widgets.js';
    script.type = 'module';
    script.async = true;

    // Append the script
    if (widgetContainerRef.current) {
      widgetContainerRef.current.appendChild(script);
    }

    return () => {
      // Cleanup
      if (widgetContainerRef.current) {
        // Remove script if it exists
        const existingScript = widgetContainerRef.current.querySelector(
          'script[src="https://widgets.api-sports.io/2.0.3/widgets.js"]'
        );
        if (existingScript) {
          widgetContainerRef.current.removeChild(existingScript);
        }

        // Remove widget div if it exists
        const existingWidget = document.getElementById('wg-api-baseball-games');
        if (existingWidget && widgetContainerRef.current.contains(existingWidget)) {
          widgetContainerRef.current.removeChild(existingWidget);
        }
      }
    };
  }, [apiKey, date, league, season, theme, refresh, showToolbar, showErrors, showLogos, modalGame, modalStandings, modalShowLogos]);

  return <div ref={widgetContainerRef} style={{ minHeight: '500px' }} />;
};

BaseballWidget.propTypes = {
  apiKey: PropTypes.string,
  date: PropTypes.string,
  league: PropTypes.string,
  season: PropTypes.string,
  theme: PropTypes.string,
  refresh: PropTypes.number,
  showToolbar: PropTypes.bool,
  showErrors: PropTypes.bool,
  showLogos: PropTypes.bool,
  modalGame: PropTypes.bool,
  modalStandings: PropTypes.bool,
  modalShowLogos: PropTypes.bool
};

export default BaseballWidget;