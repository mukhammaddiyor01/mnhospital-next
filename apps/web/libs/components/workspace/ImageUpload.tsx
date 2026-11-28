import { useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import { useWorkspaceText } from './useWorkspaceText';
const SINGLE = gql`
	mutation WorkspaceImageUpload($file: Upload!, $target: String!) {
		imageUploader(file: $file, target: $target)
	}
`;
const MULTIPLE = gql`
	mutation WorkspaceImagesUpload($files: [Upload!]!, $target: String!) {
		imagesUploader(files: $files, target: $target)
	}
`;
export default function ImageUpload({
	target,
	multiple,
	onUploaded,
	onBusy,
}: {
	target: string;
	multiple?: boolean;
	onUploaded: (paths: string[]) => void;
	onBusy: (value: boolean) => void;
}) {
	const w = useWorkspaceText();
	const [error, setError] = useState('');
	const [upload, { loading }] = useMutation(multiple ? MULTIPLE : SINGLE);
	const send = async (files: File[]) => {
		if (!files.length || loading) return;
		if (
			files.some(
				(file) =>
					!['image/png', 'image/jpeg'].includes(file.type) ||
					file.size > 5 * 1024 * 1024,
			) ||
			files.length > 10
		) {
			setError('PNG / JPEG · 5 MB · 1–10');
			return;
		}
		onBusy(true);
		setError('');
		try {
			const result = await upload({
				variables: multiple ? { files, target } : { file: files[0], target },
			});
			const paths = multiple
				? result.data?.imagesUploader
				: [result.data?.imageUploader];
			if (!paths?.length || paths.some((path: any) => typeof path !== 'string'))
				throw new Error(w('retry'));
			onUploaded(paths);
		} catch (e: any) {
			setError(e.message);
		} finally {
			onBusy(false);
		}
	};
	return (
		<div>
			<input
				aria-label={w('upload')}
				type="file"
				accept="image/png,image/jpeg"
				multiple={multiple}
				disabled={loading}
				onChange={(e) => {
					void send(Array.from(e.target.files ?? []));
					e.currentTarget.value = '';
				}}
			/>
			{loading && <span role="status">{w('upload')}…</span>}
			{error && <p role="alert">{error}</p>}
		</div>
	);
}
