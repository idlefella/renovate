import { codeBlock } from 'common-tags';
import { GolangVersionDatasource } from '../../datasource/golang-version';
import { NodeVersionDatasource } from '../../datasource/node-version';
import { PythonVersionDatasource } from '../../datasource/python-version';
import { RubyVersionDatasource } from '../../datasource/ruby-version';
import { extractPackageFile } from '.';

describe('modules/manager/devcontainer/extract', () => {
  describe('extractPackageFile()', () => {
    it('returns null when the dev container JSON file is empty', () => {
      // Arrange
      const content = '';
      const packageFile = '';
      const extractConfig = {};
      // Act
      const result = extractPackageFile(content, packageFile, extractConfig);

      // Assert
      expect(result).toBeNull();
    });

    it('returns null when the dev container JSON file contents are malformed', () => {
      // Arrange
      const content = 'malformed json}}}';
      const packageFile = '';
      const extractConfig = {};
      // Act
      const result = extractPackageFile(content, packageFile, extractConfig);

      // Assert
      expect(result).toBeNull();
    });

    it('tests if JSONC can be parsed', () => {
      // Arrange
      const content = codeBlock(`
      {
        // hello
        "features": {
          "devcontainer.registry.renovate.com/test/features/first:1.2.3": {},
        }
      }`);
      const extractConfig = {};
      // Act
      const result = extractPackageFile(
        content,
        'devcontainer.json',
        extractConfig,
      );

      // Assert
      expect(result).toEqual({
        deps: [
          {
            autoReplaceStringTemplate:
              '{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}',
            currentDigest: undefined,
            currentValue: '1.2.3',
            datasource: 'docker',
            depName: 'devcontainer.registry.renovate.com/test/features/first',
            packageName:
              'devcontainer.registry.renovate.com/test/features/first',
            depType: 'feature',
            pinDigests: false,
            replaceString:
              'devcontainer.registry.renovate.com/test/features/first:1.2.3',
          },
        ],
      });
    });

    it('returns feature image deps when only the features property is defined in dev container JSON file', () => {
      // Arrange
      const content = codeBlock(`
      {
        "features": {
          "devcontainer.registry.renovate.com/test/features/first:1.2.3": {},
          "devcontainer.registry.renovate.com/test/features/second:4.5.6": {}
        }
      }`);
      const extractConfig = {};
      // Act
      const result = extractPackageFile(
        content,
        'devcontainer.json',
        extractConfig,
      );

      // Assert
      expect(result).toEqual({
        deps: [
          {
            autoReplaceStringTemplate:
              '{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}',
            currentDigest: undefined,
            currentValue: '1.2.3',
            datasource: 'docker',
            depName: 'devcontainer.registry.renovate.com/test/features/first',
            packageName:
              'devcontainer.registry.renovate.com/test/features/first',
            depType: 'feature',
            pinDigests: false,
            replaceString:
              'devcontainer.registry.renovate.com/test/features/first:1.2.3',
          },
          {
            autoReplaceStringTemplate:
              '{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}',
            currentDigest: undefined,
            currentValue: '4.5.6',
            datasource: 'docker',
            depName: 'devcontainer.registry.renovate.com/test/features/second',
            packageName:
              'devcontainer.registry.renovate.com/test/features/second',
            depType: 'feature',
            pinDigests: false,
            replaceString:
              'devcontainer.registry.renovate.com/test/features/second:4.5.6',
          },
        ],
      });
    });

    it('returns image and feature image deps when both image and features properties are defined in dev container JSON file', () => {
      // Arrange
      const content = codeBlock(`
      {
        "image": "devcontainer.registry.renovate.com/test/image:1.2.3",
        "features": {
          "devcontainer.registry.renovate.com/test/feature:4.5.6": {}
        }
      }`);
      const extractConfig = {};

      // Act
      const result = extractPackageFile(
        content,
        'devcontainer.json',
        extractConfig,
      );

      // Assert
      expect(result).toEqual({
        deps: [
          {
            autoReplaceStringTemplate:
              '{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}',
            currentDigest: undefined,
            currentValue: '1.2.3',
            datasource: 'docker',
            depName: 'devcontainer.registry.renovate.com/test/image',
            packageName: 'devcontainer.registry.renovate.com/test/image',
            depType: 'image',
            replaceString:
              'devcontainer.registry.renovate.com/test/image:1.2.3',
          },
          {
            autoReplaceStringTemplate:
              '{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}',
            currentDigest: undefined,
            currentValue: '4.5.6',
            datasource: 'docker',
            depName: 'devcontainer.registry.renovate.com/test/feature',
            packageName: 'devcontainer.registry.renovate.com/test/feature',
            depType: 'feature',
            pinDigests: false,
            replaceString:
              'devcontainer.registry.renovate.com/test/feature:4.5.6',
          },
        ],
      });
    });

    it('returns image dep when only the image property is defined in dev container JSON file', () => {
      // Arrange
      const content = codeBlock(`
      {
        "image": "devcontainer.registry.renovate.com/test/image:1.2.3"
      }`);
      const extractConfig = {};
      // Act
      const result = extractPackageFile(
        content,
        'devcontainer.json',
        extractConfig,
      );

      // Assert
      expect(result).toEqual({
        deps: [
          {
            autoReplaceStringTemplate:
              '{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}',
            currentDigest: undefined,
            currentValue: '1.2.3',
            datasource: 'docker',
            depName: 'devcontainer.registry.renovate.com/test/image',
            packageName: 'devcontainer.registry.renovate.com/test/image',
            depType: 'image',
            replaceString:
              'devcontainer.registry.renovate.com/test/image:1.2.3',
          },
        ],
      });
    });

    it('returns null when the only feature property is malformed and no image property is defined in dev container JSON file', () => {
      // Arrange
      const content = codeBlock(`
      {
        "features": {
          "malformedFeature": {}
        }
      }`);
      const extractConfig = {};
      // Act
      const result = extractPackageFile(
        content,
        'devcontainer.json',
        extractConfig,
      );

      // Assert
      expect(result).toBeNull();
    });

    it('returns null when the features property is malformed and no image property is defined in dev container JSON file', () => {
      // Arrange
      const content = codeBlock(`
      {
        "features": "devcontainer.registry.renovate.com/test:1.2.3"
      }`);
      const extractConfig = {};
      // Act
      const result = extractPackageFile(
        content,
        'devcontainer.json',
        extractConfig,
      );

      // Assert
      expect(result).toBeNull();
    });

    it('returns null when the image property is malformed and no features are defined in dev container JSON file', () => {
      // Arrange
      const content = codeBlock(`
      {
        "image:": "devcontainer.registry.renovate.com/test/image:1.2.3"
      }`);
      const extractConfig = {};
      // Act
      const result = extractPackageFile(
        content,
        'devcontainer.json',
        extractConfig,
      );

      // Assert
      expect(result).toBeNull();
    });

    it('returns null when no image or features properties are defined in dev container JSON file', () => {
      // Arrange
      const content = codeBlock('{}');
      const extractConfig = {};
      // Act
      const result = extractPackageFile(
        content,
        'devcontainer.json',
        extractConfig,
      );

      // Assert
      expect(result).toBeNull();
    });

    it('returns null when the features property is null and no image property is defined in dev container JSON file', () => {
      // Arrange
      const content = codeBlock(`
      {
        "features": null
      }`);
      const extractConfig = {};
      // Act
      const result = extractPackageFile(
        content,
        'devcontainer.json',
        extractConfig,
      );

      // Assert
      expect(result).toBeNull();
    });

    it('returns null when the features property is not defined and the image property is null in dev container JSON file', () => {
      // Arrange
      const content = codeBlock(`
      {
        "image": null
      }`);
      const extractConfig = {};
      // Act
      const result = extractPackageFile(
        content,
        'devcontainer.json',
        extractConfig,
      );

      // Assert
      expect(result).toBeNull();
    });

    it('returns null when both the image and features properties are null', () => {
      // Arrange
      const content = codeBlock(`
      {
        "image": null,
        "features": null
      }`);
      const extractConfig = {};
      // Act
      const result = extractPackageFile(
        content,
        'devcontainer.json',
        extractConfig,
      );

      // Assert
      expect(result).toBeNull();
    });

    it('returns only docker dependencies when non-docker feature types are defined beneath the features property in dev container JSON file', () => {
      // Arrange
      const content = codeBlock(`
      {
        "features": {
          "devcontainer.registry.renovate.com/test/feature:1.2.3": {},
          "./localfeature": {},
          "devcontainer.registry.renovate.com/test/feature/other.tgz": {}
        }
      }`);
      const extractConfig = {};

      // Act
      const result = extractPackageFile(
        content,
        'devcontainer.json',
        extractConfig,
      );

      // Assert
      expect(result).toEqual({
        deps: [
          {
            autoReplaceStringTemplate:
              '{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}',
            currentDigest: undefined,
            currentValue: '1.2.3',
            datasource: 'docker',
            depName: 'devcontainer.registry.renovate.com/test/feature',
            packageName: 'devcontainer.registry.renovate.com/test/feature',
            depType: 'feature',
            pinDigests: false,
            replaceString:
              'devcontainer.registry.renovate.com/test/feature:1.2.3',
          },
        ],
      });
    });

    it('parses known tool versions', () => {
      // Arrange
      const content = codeBlock`
      {
        "features": {
          "ghcr.io/devcontainers/features/go:1": {"version": "1.24"},
          "ghcr.io/devcontainers/features/node:1": {"version": "20"},
          "ghcr.io/devcontainers/features/python:1": {"version": "3.12"},
          "ghcr.io/devcontainers/features/ruby:1": {}
        }
      }`;
      const extractConfig = {
        registryAliases: {
          'ghcr.io/devcontainers': 'some-registry.io/mirror',
        },
      };

      // Act
      const result = extractPackageFile(
        content,
        'devcontainer.json',
        extractConfig,
      );

      // Assert
      expect(result).toMatchObject({
        deps: [
          {
            currentValue: '1',
            datasource: 'docker',
            depName: 'ghcr.io/devcontainers/features/go',
            packageName: 'some-registry.io/mirror/features/go',
            depType: 'feature',
          },
          {
            currentValue: '1.24',
            datasource: GolangVersionDatasource.id,
            depName: 'go',
          },
          {
            currentValue: '1',
            datasource: 'docker',
            depName: 'ghcr.io/devcontainers/features/node',
            packageName: 'some-registry.io/mirror/features/node',
            depType: 'feature',
          },
          {
            currentValue: '20',
            datasource: NodeVersionDatasource.id,
            depName: 'node',
          },
          {
            currentValue: '1',
            datasource: 'docker',
            depName: 'ghcr.io/devcontainers/features/python',
            packageName: 'some-registry.io/mirror/features/python',
            depType: 'feature',
          },
          {
            currentValue: '3.12',
            datasource: PythonVersionDatasource.id,
            depName: 'python',
          },
          {
            currentValue: '1',
            datasource: 'docker',
            depName: 'ghcr.io/devcontainers/features/ruby',
            packageName: 'some-registry.io/mirror/features/ruby',
            depType: 'feature',
          },
          {
            currentValue: undefined,
            datasource: RubyVersionDatasource.id,
            depName: 'ruby',
            skipReason: 'unspecified-version',
          },
        ],
      });
    });
  });
});
