import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Box, Container, Stack } from '@mui/system';
import InfoIcon from '@mui/icons-material/Info';
import { enqueueSnackbar } from 'notistack';
import FileRecentItem from '../file-recent-item';
import EmptyContent from 'src/components/empty-content';
import FileManagerPanel from '../file-manager-panel';
import FileManagerNewDialogParent from '../file-manager-new-dialog-parent-id';
import { useFetchDetail } from './folderDetail';
import { useMutationFolder } from 'src/sections/overview/app/view/folders';
import { useIndexTag } from 'src/sections/tag/view/TagMutation';
import { paths } from 'src/routes/paths';

export const FIleManagerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch folder details and tags
  const { data, isLoading, refetch, error } = useFetchDetail(id);
  const { data: tagsResponse = {}, isLoading: isLoadingTags, error: tagsError } = useIndexTag();
  const tagsData = Array.isArray(tagsResponse.data) ? tagsResponse.data : [];

  // States
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  // Folder navigation state
  const [folderStack, setFolderStack] = useState([]);

  const [openCreateFolderDialog, setOpenCreateFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  // Folder creation mutation
  const { mutate: createFolder, isLoading: isCreating } = useMutationFolder({
    onSuccess: () => {
      enqueueSnackbar('Folder successfully created.', { variant: 'success' });
      refetch();
      handleCloseCreateFolderDialog();

    },
    onError: (error) => {
      console.error('Error creating folder:', error);
      enqueueSnackbar('Failed to create folder.', { variant: 'error' });
    },
  });

  const handleFolderCreate = () => {
    if (folderName.trim() === '') {
      enqueueSnackbar('Please enter a folder name.', { variant: 'warning' });
      return;
    }

    if (selectedTagIds.length === 0) {
      enqueueSnackbar('Please select at least one tag.', { variant: 'warning' });
      return;
    }

    const folderData = {
      name: folderName,
      tag_ids: selectedTagIds,
      parent_id: id,
    };

 


    createFolder(folderData);
  };

  // Handle tag selection
  const handleTagChange = (event) => {
    // Check if event is an array or an object with target
    const value = Array.isArray(event) ? event : event.target.value;

    // Update state with selected tags
    setSelectedTagIds(typeof value === 'string' ? value.split(',') : value);
  };

  // Open/Close dialogs
  const handleOpenUploadDialog = useCallback(() => setOpenUploadDialog(true), []);
  const handleCloseUploadDialog = useCallback(() => setOpenUploadDialog(false), []);
  const handleOpenCreateFolderDialog = useCallback(() => setOpenCreateFolderDialog(true), []);
  const handleCloseCreateFolderDialog = useCallback(() => {
    setOpenCreateFolderDialog(false);
    setFolderName('');
    setSelectedTagIds([]);
  }, []);

  // Folder navigation: Move to subfolder
  const handleSubfolderClick = useCallback(
    (folderId, folderName) => {
      setFolderStack((prev) => [...prev, { id, name: data.folder_info.name }]); // Save current folder id and name in stack
      navigate(`/dashboard/file-manager/info/${folderId}`, { replace: true });
    },
    [navigate, id, data]
  );

  // Show folder ID when InfoIcon is clicked
  const handleInfoClick = () => {
    if (data && data.folder_info) {
      enqueueSnackbar(`Folder ID: ${data.folder_info.folder_id}`, { variant: 'info' });
    } else {
      enqueueSnackbar('Folder data is not available.', { variant: 'warning' });
    }
  };

  // Fetch folder details when ID changes
  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching folder details.</div>;
  }

  if (tagsError) {
    return <div>Error fetching tags.</div>;
  }

  return (
    <>
      <Container>
        <Box sx={{ my: 5 }}>
          <Typography variant="h6">
            <span
              style={{
                cursor: 'pointer',
                color: 'rgba(0, 0, 0, 0.5)', // Warna lebih terang untuk navigasi breadcrumb sebelumnya
                textDecoration: 'underline', // Teks underline untuk menunjukkan bahwa bisa diklik
                marginRight: '8px',
              }}
              onClick={() => navigate(paths.dashboard.root)} // Navigasi ke root dashboard
            >
              My Drive &raquo;
            </span>

            {folderStack.map((folder, index) => (
              <span
                key={folder.id} // Use `folder.id` instead of `folderId`
                style={{
                  cursor: 'pointer',
                  color: 'rgba(0, 0, 0, 0.5)', // Lighter color for previous folders
                  textDecoration: 'underline',
                  marginRight: '8px',
                }}
                onClick={() => {
                  // Navigate back to the clicked folder
                  const newStack = folderStack.slice(0, index);
                  setFolderStack(newStack);
                  navigate(`/dashboard/file-manager/info/${folder.id}`, { replace: true });
                }}
              >
               {folder.name} &raquo; {/* Use `folder.name` instead of `folderId` */}
              </span>
            ))}

            {/* Current folder name */}
            <span style={{ color: 'black' }}>{data.folder_info.name}</span>

            {/* InfoIcon displays folder.id */}
            <InfoIcon
              fontSize="medium"
              sx={{ mt: 3, cursor: 'pointer' }}
              onClick={handleInfoClick}
            />
          </Typography>
        </Box>

        {data.subfolders.length === 0 && data.files.length === 0 ? (
          <>
            <Button variant="contained" onClick={handleOpenCreateFolderDialog}>
              Create New Folder
            </Button>
            <FileManagerPanel
              title="Upload Files"
              link={paths.dashboard.fileManager}
              onOpen={handleOpenUploadDialog}
              sx={{ mt: 5 }}
            />
            <EmptyContent filled title="No Content" sx={{ py: 10 }} />
          </>
        ) : (
          <>
            <Button variant="contained" onClick={handleOpenCreateFolderDialog}>
              Create New Folder
            </Button>
            <FileManagerPanel
              title="Upload Files"
              link={paths.dashboard.fileManager}
              onOpen={handleOpenUploadDialog}
              sx={{ mt: 5 }}
            />

            <Typography sx={{ mb: 2, mt: 10 }}>Subfolders</Typography>
            {data.subfolders.map((folder) => (
              <div key={folder.id} onClick={() => handleSubfolderClick(folder.id, folder.name)}>
                <FileRecentItem
                  file={{ ...folder, type: 'folder' }}
                  onRefetch={refetch}
                  onDelete={() => console.info('DELETE', folder.id)}
                />
              </div>
            ))}

            {data.files.length > 0 && (
              <Stack spacing={2} sx={{ mt: 5 }}>
                <Typography sx={{ mb: 2, mt: 5 }}>Files</Typography>
                {data.files.map((file) => (
                  <FileRecentItem
                    key={file.id}
                    file={file}
                    onRefetch={refetch}
                    onDelete={() => console.info('DELETE', file.id)}
                  />
                ))}
              </Stack>
            )}
          </>
        )}
      </Container>

      {/* Create Folder Dialog */}
      <Dialog open={openCreateFolderDialog} onClose={handleCloseCreateFolderDialog}>
        <DialogTitle>Create Folder</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Please enter the name of the folder you want to create.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Folder Name"
            type="text"
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />

          {/* Tag selection */}
          <FormControl fullWidth margin="dense">
            <InputLabel id="tags-label">Tags</InputLabel>
            <Select
              labelId="tags-label"
              id="tags"
              multiple
              value={selectedTagIds}
              onChange={(e) => handleTagChange(e.target.value)} // Pass the value directly
              input={<OutlinedInput id="select-multiple-chip" label="Tags" />}
              renderValue={(selected) => (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    maxHeight: 100,
                    overflowY: 'auto',
                  }}
                >
                  {selected.map((tagId) => {
                    const tag = tagsData.find((t) => t.id === tagId);
                    return <Chip key={tagId} label={tag?.name || tagId} />;
                  })}
                </Box>
              )}
            >
              {isLoadingTags ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : tagsData.length > 0 ? (
                tagsData.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No tags available</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseCreateFolderDialog}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleFolderCreate} disabled={isCreating}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Files Dialog */}
      <FileManagerNewDialogParent
        title="Upload Files"
        open={openUploadDialog}
        onClose={handleCloseUploadDialog}
        id={id}
        // onCreate={() => {}} // Define these handlers or remove if not needed
        // onUpdate={() => {}}
        folderName={folderName}
        onChangeFolderName={(name) => setFolderName(name)}
        refetch={refetch}
        tags={tagsData} // Ensure 'tagsData' is used here
        selectedTags={selectedTagIds} // Ensure 'selectedTagIds' is used here
        onTagChange={handleTagChange} // Ensure 'handleTagChange' is used here
      />
    </>
  );
};
