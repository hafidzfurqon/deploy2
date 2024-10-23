import { Button, Stack, Typography, Grid, CircularProgress, Box } from '@mui/material';
import { paths } from 'src/routes/paths';
import { m } from 'framer-motion';
import { varFade } from 'src/components/animate';
import ArticleIcon from '@mui/icons-material/Article';
import { useFetchNewsLandingPage } from './view/fetchNews/useFetchNewsLandingPage';
import EventIcon from '@mui/icons-material/Event';

export default function Informasi() {
  const { data, isLoading } = useFetchNewsLandingPage();

  // Get the two most recent news articles
  const getRecentNews = () => {
    if (!data || !data.data) return [];
    // Sort news articles by date descending and limit to two articles
    const sortedNews = data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return sortedNews.slice(0, 2);
  };

  const recentNews = getRecentNews();

  return (
    <Grid
      item
      container
      xs={12}
      md={12}
      sx={{
        position: 'relative',
        backgroundColor: '#f9f9f9',
        overflow: 'hidden',
        minHeight: '100vh',
      }}
    >
      {/* Background Shapes */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          left: '-50px',
          width: '180px',
          height: '150px',
          backgroundColor: '#e2e8f0',
          borderRadius: '0 0 300px 0',
          zIndex: 1,
        }}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        style={{
          position: 'absolute',
          bottom: -200,
          width: '180%',
          height: '494px',
          zIndex: 0,
        }}
      >
        <path
          fill="#6EC207"
          d="M0,224L60,213.3C120,203,240,181,360,160C480,139,600,117,720,122.7C840,128,960,160,1080,165.3C1200,171,1320,149,1380,138.7L1440,128V320H1380H1200H1080H960H840H720H600H480H360H240H120H60H0Z"
        />
      </svg>

      <Grid item xs={12}>
        <m.div variants={varFade().inUp}>
          <Typography
            variant="h4"
            align="center"
            sx={{ mt: 10, mb: 5, color: '#6EC207' }}
            gutterBottom
          >
            Informasi & Pengumuman
          </Typography>
        </m.div>
      </Grid>

      {/* News Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2} justifyContent="center">
          {isLoading ? (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <CircularProgress />
            </Grid>
          ) : recentNews.length > 0 ? (
            recentNews.map((news) => {
              const formattedDate = new Date(news.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              return (
                <Grid item xs={12} sm={6} md={5} key={news.id}>
                  <m.div variants={varFade().inUp}>
                    <Stack
                      alignItems="flex-start"
                      spacing={2}
                      sx={{
                        p: 4,
                        borderRadius: 2,
                        backgroundColor: 'primary.main',
                        color: 'common.white',
                        textAlign: 'center',
                        mx: 'auto',
                        zIndex: 1,
                      }}
                    >
                      <Typography variant="h4">
                        <span dangerouslySetInnerHTML={{ __html: news.title }} />
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          maxWidth: 400,
                          maxHeight: 110,
                          overflowY: 'auto',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'initial',
                        }}
                      >
                        <span dangerouslySetInnerHTML={{ __html: news.content }} />
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                          alignItems: 'center',
                          mt: 'auto',
                        }}
                      >
                        <Typography variant="body2" color="">
                          <EventIcon sx={{ fontSize: 17, verticalAlign: 'middle', mr: 0.5 }} />
                          {formattedDate}
                        </Typography>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() =>
                            (window.location.href = `${paths.news.detail}/${news.slug}`)
                          }
                          sx={{
                            mt: 2,
                            backgroundColor: '#80b918',
                            '&:hover': {
                              backgroundColor: '#55a630',
                            },
                          }}
                        >
                          Baca Selengkapnya
                        </Button>
                      </Box>
                    </Stack>
                  </m.div>
                </Grid>
              );
            })
          ) : (
            // No news available
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                  backgroundColor: 'primary.main',
                  color: 'common.white',
                  borderRadius: 2,
                  boxShadow: 3,
                  p: 3,
                }}
              >
                <ArticleIcon fontSize="large" sx={{ mb: 2 }} />
                <Typography variant="h6" align="center">
                  Tidak ada Berita yang tersedia.
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  Silakan periksa kembali nanti atau hubungi dukungan untuk bantuan.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* More... Button */}
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 10 }}>
        <m.div variants={varFade().inUp}>
          <Button
            variant="contained"
            onClick={() => (window.location.href = paths.news.informasi)}
            sx={{
              backgroundColor: 'primary.main',
              color: 'common.white',
              px: 4,
              py: 1,
              transition: 'transform 0.3s ease-in-out, backgroundColor 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
                backgroundColor: 'primary.dark',
              },
            }}
          >
            Lihat Selengkapnya...
          </Button>
        </m.div>
      </Grid>
    </Grid>
  );
}
