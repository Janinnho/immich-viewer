<script lang="ts">
  import { alwaysLoadOriginalFile } from '$lib/stores/preferences.store';
  import { isMobileDevice } from '$lib/utils/device-utils';
  import {
    EquirectangularAdapter,
    Viewer,
    events,
    type AdapterConstructor,
    type PluginConstructor,
  } from '@photo-sphere-viewer/core';
  import '@photo-sphere-viewer/core/index.css';
  import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';
  import '@photo-sphere-viewer/gyroscope-plugin/index.css';
  import { ResolutionPlugin } from '@photo-sphere-viewer/resolution-plugin';
  import { SettingsPlugin } from '@photo-sphere-viewer/settings-plugin';
  import '@photo-sphere-viewer/settings-plugin/index.css';
  import { onDestroy, onMount } from 'svelte';

  interface Props {
    panorama: string | { source: string };
    originalPanorama?: string | { source: string };
    adapter?: AdapterConstructor | [AdapterConstructor, unknown];
    plugins?: (PluginConstructor | [PluginConstructor, unknown])[];
    navbar?: boolean;
  }

  let { panorama, originalPanorama, adapter = EquirectangularAdapter, plugins = [], navbar = false }: Props = $props();

  let container: HTMLDivElement | undefined = $state();
  let viewer: Viewer;
  let gyroscopeEnabled = $state(false);
  let is360DegreeImage = $state(true); // Assuming this is a 360-degree image context

  onMount(() => {
    if (!container) {
      return;
    }

    const basePlugins: (PluginConstructor | [PluginConstructor, unknown])[] = [
      SettingsPlugin,
      [
        ResolutionPlugin,
        {
          // For 360-degree images, skip intermediate resolutions and load high-res by default
          // This avoids blurry intermediate previews since 360° images are essentially always "zoomed in"
          defaultResolution: is360DegreeImage && originalPanorama ? 'original' : 'default',
          resolutions: is360DegreeImage && originalPanorama ? [
            // For 360° images, only provide original resolution to bypass intermediate quality
            {
              id: 'original',
              label: 'High Quality',
              panorama: originalPanorama,
            },
          ] : [
            // Standard resolution handling for regular images
            {
              id: 'default',
              label: 'Default',
              panorama,
            },
            ...(originalPanorama
              ? [
                  {
                    id: 'original',
                    label: 'Original',
                    panorama: originalPanorama,
                  },
                ]
              : []),
          ],
        },
      ],
    ];

    // Add gyroscope plugin for mobile devices
    if (isMobileDevice()) {
      basePlugins.push([
        GyroscopePlugin,
        {
          touchmove: true,
          absolutePosition: true,
        }
      ]);
    }

    viewer = new Viewer({
      adapter,
      plugins: [
        ...basePlugins,
        ...plugins,
      ],
      container,
      // Enhanced mobile touch settings for better responsiveness
      touchmoveTwoFingers: false,
      mousewheelCtrlKey: false,
      // Mobile optimized settings for faster panning response (Google Maps-like)
      moveInertia: isMobileDevice(),
      moveSpeed: isMobileDevice() ? 2.0 : 1.0, // Increased speed for mobile devices
      zoomSpeed: isMobileDevice() ? 2.0 : 1.0, // Faster zoom on mobile
      // Touch sensitivity improvements for mobile
      touchmoveThreshold: isMobileDevice() ? 10 : 20, // Lower threshold for more responsive touch
      navbar,
      minFov: 10,
      maxFov: 120,
      fisheye: false,
    });
    const resolutionPlugin = viewer.getPlugin(ResolutionPlugin) as ResolutionPlugin;
    
    // For 360-degree images, we bypass intermediate resolutions entirely
    // since they appear too blurry (8K 360° ≈ FullHD flat when viewing a portion)
    if (is360DegreeImage && originalPanorama) {
      // 360° images start with high resolution immediately - no zoom-based switching needed
      setTimeout(() => {
        void resolutionPlugin.setResolution('original');
      }, 100);
    } else if (!$alwaysLoadOriginalFile && originalPanorama) {
      // Standard zoom-based resolution switching for regular images
      const zoomHandler = ({ zoomLevel }: events.ZoomUpdatedEvent) => {
        // zoomLevel range: [0, 100]
        if (Math.round(zoomLevel) >= 75) {
          // Replace the preview with the original
          void resolutionPlugin.setResolution('original');
          viewer.removeEventListener(events.ZoomUpdatedEvent.type, zoomHandler);
        }
      };

      viewer.addEventListener(events.ZoomUpdatedEvent.type, zoomHandler, { passive: true });
    }

    // Handle gyroscope toggle functionality
    const gyroscopePlugin = viewer.getPlugin(GyroscopePlugin) as GyroscopePlugin | undefined;
    if (gyroscopePlugin) {
      gyroscopePlugin.stop(); // Start with gyroscope disabled
    }

    return () => {
      const zoomHandler = ({ zoomLevel }: events.ZoomUpdatedEvent) => {
        if (Math.round(zoomLevel) >= 75) {
          void resolutionPlugin.setResolution('original');
          viewer.removeEventListener(events.ZoomUpdatedEvent.type, zoomHandler);
        }
      };
      viewer.removeEventListener(events.ZoomUpdatedEvent.type, zoomHandler);
    };
  });

  // Function to toggle gyroscope
  const toggleGyroscope = () => {
    if (!isMobileDevice()) return;
    
    const gyroscopePlugin = viewer?.getPlugin(GyroscopePlugin) as GyroscopePlugin | undefined;
    if (gyroscopePlugin) {
      if (gyroscopeEnabled) {
        gyroscopePlugin.stop();
        gyroscopeEnabled = false;
      } else {
        gyroscopePlugin.start();
        gyroscopeEnabled = true;
      }
    }
  };

  onDestroy(() => {
    if (viewer) {
      viewer.destroy();
    }
  });
</script>

<div class="relative h-full w-full">
  <div class="h-full w-full mb-0" bind:this={container}></div>
  
  <!-- Gyroscope toggle button for mobile devices -->
  {#if isMobileDevice()}
    <button
      class="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200 z-10"
      onclick={toggleGyroscope}
      title={gyroscopeEnabled ? 'Disable Gyroscope' : 'Enable Gyroscope'}
      aria-label={gyroscopeEnabled ? 'Disable Gyroscope' : 'Enable Gyroscope'}
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        class="transition-transform duration-200 {gyroscopeEnabled ? 'text-blue-400' : 'text-white'}"
      >
        <path 
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
          fill="currentColor"
        />
        <path 
          d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" 
          fill="currentColor"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
      </svg>
    </button>
  {/if}
</div>
