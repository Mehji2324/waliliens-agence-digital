import { useEffect, useState } from 'react';
import { projectsService } from '../services/api/projects';
import { servicesService } from '../services/api/services';
import type { Project, Service } from '../types';

interface CatalogState<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
}

const useCatalog = <T>(load: () => Promise<{ data: T[] }>): CatalogState<T> => {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    load()
      .then(({ data }) => {
        if (active) setItems(data);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Unable to load content.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [load]);

  return { items, isLoading, error };
};

const loadProjects = () => projectsService.getAll();
const loadServices = () => servicesService.getAll();

export const useProjects = () => useCatalog<Project>(loadProjects);
export const useServices = () => useCatalog<Service>(loadServices);
