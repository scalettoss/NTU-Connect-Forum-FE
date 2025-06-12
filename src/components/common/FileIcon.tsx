import React from 'react';
import {
    FaFilePdf,
    FaFileWord,
    FaFileExcel,
    FaFileImage,
    FaFileAlt,
    FaFilePowerpoint,
    FaFileAudio
} from 'react-icons/fa';

interface FileIconProps {
    fileType: string;
    size?: number;
}

const FileIcon: React.FC<FileIconProps> = ({ fileType, size = 14 }) => {
    switch (fileType) {
        case 'pdf':
            return <FaFilePdf className="text-red-500" size={size} />;
        case 'word':
            return <FaFileWord className="text-blue-600" size={size} />;
        case 'excel':
            return <FaFileExcel className="text-green-600" size={size} />;
        case 'powerpoint':
            return <FaFilePowerpoint className="text-orange-500" size={size} />;
        case 'audio':
            return <FaFileAudio className="text-purple-500" size={size} />;
        case 'text':
            return <FaFileAlt className="text-gray-600" size={size} />;
        case 'image':
            return <FaFileImage className="text-indigo-500" size={size} />;
        default:
            return <FaFileAlt className="text-gray-500" size={size} />;
    }
};

export default FileIcon; 