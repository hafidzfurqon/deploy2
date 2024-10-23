import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/system/Unstable_Grid/Grid';
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import { useCreateUser } from './view/UserManagement';
import { Button, MenuItem } from '@mui/material';
import { useIndexInstance } from '../instancepages/view/Instance';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { QueryClient, useQueryClient } from '@tanstack/react-query';

export default function UserNewEditForm({ currentUser }) {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: instansiList, isLoading: isLoadingInstansi } = useIndexInstance();

  const { mutate: CreateUser, isPending } = useCreateUser({
    onSuccess: () => {
      enqueueSnackbar('User created successfully', { variant: 'success' });
      reset();
      router.push(paths.dashboard.user.list);
      queryClient.invalidateQueries({ queryKey: ['list.instansi'] });
    },
    onError: (error) => {
      // Check if the error has the expected structure
      if (error.errors && error.errors.email) {
        // Set form error for the name field
        methods.setError('email', {
          type: 'manual',
          message: error.errors.email[0], // "Instance name already exists."
        });
      } else {
        enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
      }
    },
  });

  const allowedDomains = [
    'outlook.com',
    'yahoo.com',
    'aol.com',
    'lycos.com',
    'mail.com',
    'icloud.com',
    'yandex.com',
    'protonmail.com',
    'tutanota.com',
    'zoho.com',
    'gmail.com',
  ];

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required').max(100, 'Name must be at most 100 characters'),
    instansi: Yup.string().required('Instansi is required'),
    email: Yup.string()
      .required('Email is required')
      .email('Email must be a valid email address')
      .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/, 'Invalid email format')
      .test('is-valid-domain', 'Invalid email domain', (value) => {
        const domain = value ? value.split('@')[1] : '';
        return allowedDomains.includes(domain);
      }),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    role: Yup.string()
      .required('Role is required')
      .oneOf(['admin', 'user'], 'Role must be either admin or user'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      password: '',
      confirmPassword: '',
      role: currentUser?.role || '',
      instansi: currentUser?.instansiId || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const { reset, refetch, handleSubmit } = methods;

  const onSubmit = async (data) => {
  
    const { confirmPassword, ...restData } = data;
    const payload = {
      ...restData,
      password_confirmation: confirmPassword,
      instance_id: restData.instansi,
    };
   
    CreateUser(payload);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="name" label="Full Name" />
              <RHFTextField name="email" label="Email Address" />
              <RHFTextField name="password" label="Password" type="password" />
              <RHFTextField name="confirmPassword" label="Confirm Password" type="password" />
              <RHFSelect name="role" label="Role">
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </RHFSelect>
              <RHFSelect name="instansi" label="Instansi" disabled={isLoadingInstansi}>
                {!isLoadingInstansi &&
                  instansiList?.data?.map((instansi) => (
                    <MenuItem key={instansi.id} value={instansi.id}>
                      {instansi.name}
                    </MenuItem>
                  ))}
              </RHFSelect>
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <Button variant="outlined" type="submit">
                {isPending ? 'Creating User...' : 'Create User'}
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
