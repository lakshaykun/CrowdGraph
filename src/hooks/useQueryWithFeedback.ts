import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect } from 'react';

/**
 * Enhanced useQuery wrapper that provides automatic loading feedback
 * Shows loading toasts for long-running queries
 */
export function useQueryWithFeedback<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError> & { 
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    showLoadingToast?: boolean;
  }
) {
  const { loadingMessage, successMessage, errorMessage, showLoadingToast = false, ...queryOptions } = options;
  
  const query = useQuery<TData, TError>(queryOptions as any);

  // Show loading toast for long queries (>1s)
  useEffect(() => {
    if (!showLoadingToast || !query.isLoading) return;

    const timer = setTimeout(() => {
      if (query.isLoading && loadingMessage) {
        toast.loading(loadingMessage, { id: 'query-loading' });
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      toast.dismiss('query-loading');
    };
  }, [query.isLoading, loadingMessage, showLoadingToast]);

  // Show success message
  useEffect(() => {
    if (query.isSuccess && successMessage && query.data) {
      toast.success(successMessage);
    }
  }, [query.isSuccess, successMessage, query.data]);

  // Error is handled globally in queryClient config
  
  return query;
}

/**
 * Enhanced useMutation wrapper that provides automatic user feedback
 * Shows loading, success, and error toasts
 */
export function useMutationWithFeedback<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> & {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const { loadingMessage, successMessage, errorMessage, onMutate, onSuccess, onError, ...mutationOptions } = options;

  const mutation = useMutation<TData, TError, TVariables, TContext>({
    ...mutationOptions,
    onMutate: async (variables: TVariables) => {
      // Show loading toast
      if (loadingMessage) {
        toast.loading(loadingMessage, { id: 'mutation-loading' });
      }
      
      // Call original onMutate if provided
      if (onMutate) {
        return await (onMutate as any)(variables);
      }
      return undefined;
    },
    onSuccess: (data: TData, variables: TVariables, context: TContext) => {
      // Dismiss loading toast
      toast.dismiss('mutation-loading');
      
      // Show success toast
      if (successMessage) {
        toast.success(successMessage);
      }
      
      // Call original onSuccess if provided
      if (onSuccess) {
        (onSuccess as any)(data, variables, context);
      }
    },
    onError: (error: TError, variables: TVariables, context: TContext | undefined) => {
      // Dismiss loading toast
      toast.dismiss('mutation-loading');
      
      // Show error toast (if not already handled globally and custom message provided)
      if (errorMessage) {
        const message = (error as any)?.response?.data?.error || errorMessage;
        toast.error(message);
      }
      
      // Call original onError if provided
      if (onError) {
        (onError as any)(error, variables, context);
      }
    },
  } as any);

  return mutation;
}
