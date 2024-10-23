import { useQuery } from '@tanstack/react-query';
import axiosInstance, { endpoints } from 'src/utils/axios';

export const useIndexUser = (filters) => {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['list.user'],
    queryFn: async () => {
      const response = await axiosInstance.get(endpoints.users.list,);
      return response.data; 
    },
   
  });

  return {
    data,
    isLoading,
    refetch,
    isFetching,
  };
};
