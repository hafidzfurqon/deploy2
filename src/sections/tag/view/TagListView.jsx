import Scrollbar from 'src/components/scrollbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useSettingsContext } from 'src/components/settings';
import Container from '@mui/material/Container';
import {
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Checkbox,
  Toolbar,
  Typography,
  InputAdornment,
} from '@mui/material';
import { useState } from 'react';
import { useIndexTag, useEditTag, useDeleteTag } from './TagMutation';
import { useSnackbar } from 'notistack';
import CustomPopover from 'src/components/custom-popover';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

export default function TagListView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, setValue } = useForm();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [popover, setPopover] = useState({ open: false, anchorEl: null, currentId: null });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch tag data
  const { data, isLoading, isFetching, refetch, isError } = useIndexTag();

  const { mutate: deleteTag, isPending: loadingDelete } = useDeleteTag({
    onSuccess: () => {
      enqueueSnackbar('Tag Berhasil Dihapus', { variant: 'success' });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['tag.admin'] });
    },
    onError: (error) => {
      enqueueSnackbar(`Gagal menghapus tag: ${error.message}`, { variant: 'error' });
    },
  });

  const { mutate: editTag, isPending: loadingEdit } = useEditTag({
    onSuccess: () => {
      enqueueSnackbar('Tag Berhasil Diperbarui', { variant: 'success' });
      refetch();
      handleEditDialogClose();
      queryClient.invalidateQueries({ queryKey: ['tag.admin'] });
    },
    onError: (error) => {
      enqueueSnackbar(`Gagal memperbarui tag: ${error.message}`, { variant: 'error' });
    },
  });

  // Sort tags by creation date
  const tags = data?.data || [];
  const sortedTags = tags.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Filter tags based on search query
  const filteredTags = sortedTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id) => {
    const tagToEdit = tags.find((tag) => tag.id === id);
    if (tagToEdit) {
      setValue('name', tagToEdit.name);
      setPopover((prev) => ({ ...prev, currentId: id }));
      setEditDialogOpen(true);
    } else {
      enqueueSnackbar('Tag tidak ditemukan', { variant: 'error' });
    }
  };

  const handleDelete = (id) => {
    setSelectedTagId(id);
    setDeleteConfirmOpen(true);
    handlePopoverClose();
  };

  const confirmDelete = () => {
    deleteTag(selectedTagId);
    setDeleteConfirmOpen(false);
    setSelectedTagId(null);
  };

  const handlePopoverOpen = (event, id) => {
    setPopover({ open: true, anchorEl: event.currentTarget, currentId: id });
  };

  const handlePopoverClose = () => {
    setPopover({ ...popover, open: false });
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSubmit = (data) => {
    if (popover.currentId) {
      editTag({ tagId: popover.currentId, data });
      setEditDialogOpen(false);
    } else {
      enqueueSnackbar('ID tidak ditemukan untuk mengedit tag', { variant: 'error' });
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = tags.map((tag) => tag.id);
      setSelectedTags(allIds);
    } else {
      setSelectedTags([]);
    }
  };

  const handleSelectOne = (id) => {
    const selectedIndex = selectedTags.indexOf(id);
    let newSelectedTags = [];

    if (selectedIndex === -1) {
      newSelectedTags = newSelectedTags.concat(selectedTags, id);
    } else if (selectedIndex === 0) {
      newSelectedTags = newSelectedTags.concat(selectedTags.slice(1));
    } else if (selectedIndex === selectedTags.length - 1) {
      newSelectedTags = newSelectedTags.concat(selectedTags.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelectedTags = newSelectedTags.concat(
        selectedTags.slice(0, selectedIndex),
        selectedTags.slice(selectedIndex + 1)
      );
    }

    setSelectedTags(newSelectedTags);
  };

  const handleDeleteSelected = () => {
    selectedTags.forEach((id) => {
      setSelectedTagId(id);
      setDeleteConfirmOpen(true);
    });
    setSelectedTags([]);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Daftar Tag"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'List Tag', href: paths.dashboard.tag.list },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.tag.create}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Tag
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Toolbar>
        <TextField
          placeholder="Cari Tag"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ marginRight: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" />
              </InputAdornment>
            ),
          }}
        />
      </Toolbar>

      {isLoading || isFetching ? (
        <CircularProgress />
      ) : isError ? (
        <Typography color="error">Gagal memuat data</Typography>
      ) : tags.length === 0 ? (
        <EmptyContent
          filled
          title="Tidak ada tag berita"
          sx={{
            py: 10,
          }}
        />
      ) : (
        <>
          <Toolbar>
            {selectedTags.length > 0 ? (
              <Typography
                sx={{ flex: '1 1 100%' }}
                color="inherit"
                variant="subtitle1"
                component="div"
              >
                {selectedTags.length} selected
              </Typography>
            ) : null}
            {selectedTags.length > 0 && (
              <Button variant="contained" color="error" onClick={handleDeleteSelected}>
                Delete Selected
              </Button>
            )}
          </Toolbar>

          <Scrollbar>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        indeterminate={selectedTags.length > 0 && selectedTags.length < tags.length}
                        checked={tags.length > 0 && selectedTags.length === tags.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTags
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={selectedTags.indexOf(tag.id) !== -1}
                            onChange={() => handleSelectOne(tag.id)}
                          />
                        </TableCell>
                        <TableCell>{tag.name}</TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title="More Actions" placement="top">
                            <IconButton onClick={(event) => handlePopoverOpen(event, tag.id)}>
                              <Iconify icon="eva:more-vertical-fill" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={tags.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Scrollbar>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Tag</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To edit this tag, please modify the name below and click save.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Tag Name"
            fullWidth
            variant="outlined"
            {...register('name')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit(handleEditSubmit)} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <CustomPopover
        open={popover.open}
        onClose={handlePopoverClose}
        anchorEl={popover.anchorEl}
        arrow="top-right"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            handleEdit(popover.currentId);
            handlePopoverClose();
          }}
        >
          <Iconify icon="eva:edit-fill" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDelete(popover.currentId);
            handlePopoverClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Delete
        </MenuItem>
      </CustomPopover>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>Apakah Anda yakin ingin menghapus tag ini?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Batal</Button>
          <Button onClick={confirmDelete} color="error" disabled={loadingDelete}>
            {loadingDelete ? <CircularProgress size={24} /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
