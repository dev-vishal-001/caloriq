const prisma = require('../prisma/client');

exports.deleteHistoryById = async (req, res) => {
  const { id } = req.body; 
  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }

  try {
    const deletedRecord = await prisma.history.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Record deleted successfully', deleted: deletedRecord });
  } catch (error) {
    console.error('❌ Error deleting history record:', error);

    // Handle record not found case
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Record not found' });
    }

    return res.status(500).json({ message: 'Failed to delete record' });
  }
};
