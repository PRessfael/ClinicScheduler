import { useRef } from "react";
import { DOCUMENT_TYPES } from "@/lib/constants.jsx";

const RecordsUpload = ({
  uploadFormData,
  setUploadFormData,
  formErrors,
  handleFileChange,
  submitDocumentUpload
}) => {
  const fileInputRef = useRef(null);

  const handleDocumentTypeChange = (e) => {
    setUploadFormData({
      ...uploadFormData,
      documentType: e.target.value
    });
  };

  const handleDescriptionChange = (e) => {
    setUploadFormData({
      ...uploadFormData,
      description: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitDocumentUpload();
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInputChange = (e) => {
    handleFileChange(e.target.files);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Medical Documents</h3>
        <p className="text-sm text-gray-600 mb-4">
          Share external medical records or documents with our healthcare team.
        </p>

        <form onSubmit={handleSubmit}>
          <div
            className={`border-2 border-dashed ${
              formErrors.files ? "border-red-500" : "border-gray-300"
            } rounded-md p-6 text-center mb-4`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleFileInputClick}
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1e5631] hover:bg-[#143e22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e5631]"
              >
                <span>Choose files</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                />
              </button>
            </div>

            {uploadFormData.files.length > 0 && (
              <div className="mt-2 text-sm text-gray-700">
                Selected {uploadFormData.files.length} file(s)
              </div>
            )}

            {formErrors.files && (
              <p className="mt-2 text-xs text-red-500">{formErrors.files}</p>
            )}

            <p className="mt-2 text-xs text-gray-500">
              Accepted file types: PDF, JPG, JPEG, PNG. Maximum file size: 10MB.
            </p>
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="document-type"
            >
              Document Type
            </label>
            <select
              id="document-type"
              className={`w-full px-3 py-2 border ${
                formErrors.documentType ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]`}
              value={uploadFormData.documentType}
              onChange={handleDocumentTypeChange}
            >
              <option value="" disabled>
                Select document type
              </option>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {formErrors.documentType && (
              <p className="mt-1 text-xs text-red-500">{formErrors.documentType}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="document-description"
            >
              Description
            </label>
            <textarea
              id="document-description"
              rows="2"
              className={`w-full px-3 py-2 border ${
                formErrors.description ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631] focus:border-[#1e5631]`}
              placeholder="Brief description of the document"
              value={uploadFormData.description}
              onChange={handleDescriptionChange}
            ></textarea>
            {formErrors.description && (
              <p className="mt-1 text-xs text-red-500">{formErrors.description}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-[#4caf50] hover:bg-[#087f23] text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Upload Documents
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordsUpload;
