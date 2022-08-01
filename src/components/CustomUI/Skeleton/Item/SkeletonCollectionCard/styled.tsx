import { Stack, styled } from '@mui/material';

export const SkeletonCollectionCardContainer = styled(Stack)(({ theme }) => ({
	width: '100%',
	borderRadius: '15px',
	overflow: 'hidden',
	...(theme.palette.mode === 'light'
		? {
				boxShadow: `0px 0px 1px ${theme.palette.grey['500']}`,
		  }
		: {
				background: theme.palette.gradients.fourth,
		  }),
}));
