import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { SCHOOL_NAME, SCHOOL_EMAIL, SCHOOL_PHONE, SCHOOL_FOUNDED } from '../../utils/config'

/**
 * Generates a professional PDF Report Card
 * @param {Object} student - { full_name, reg_no, class, gender }
 * @param {Array} results - Array of result objects { subject, ca_score, exam_score, grade, remark, position, class_size }
 * @param {Object} sessionInfo - { term, session }
 * @param {Object} stats - { totalScore, maxScore, average, studentPos, classSize }
 */
export const generateReportCardPDF = (student, results, sessionInfo, stats) => {
  const doc = new jsPDF()

  // --- HEADER SECTIONS ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(30, 58, 138) // Brand Blue
  doc.text(SCHOOL_NAME.toUpperCase(), 105, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text(`Motto: Education for Excellence | Founded: ${SCHOOL_FOUNDED}`, 105, 26, { align: 'center' })
  doc.text(`${SCHOOL_PHONE} | ${SCHOOL_EMAIL}`, 105, 31, { align: 'center' })

  // Decorative Line
  doc.setLineWidth(0.5)
  doc.setDrawColor(30, 58, 138)
  doc.line(14, 35, 196, 35)

  // Title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('OFFICIAL STUDENT REPORT CARD', 105, 45, { align: 'center' })

  // --- STUDENT INFO BOX ---
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, 50, 182, 35, 3, 3, 'F')
  
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  
  // Left Column
  doc.setFont('helvetica', 'bold'); doc.text('Student Name:', 20, 60)
  doc.setFont('helvetica', 'normal'); doc.text(student.full_name || 'N/A', 50, 60)
  
  doc.setFont('helvetica', 'bold'); doc.text('Registration No:', 20, 70)
  doc.setFont('helvetica', 'normal'); doc.text(student.reg_no || 'N/A', 53, 70)

  doc.setFont('helvetica', 'bold'); doc.text('Class:', 20, 80)
  doc.setFont('helvetica', 'normal'); doc.text(student.class || 'N/A', 35, 80)

  // Right Column
  doc.setFont('helvetica', 'bold'); doc.text('Academic Date:', 120, 60)
  doc.setFont('helvetica', 'normal'); doc.text(`${sessionInfo.term}, ${sessionInfo.session}`, 155, 60)
  
  doc.setFont('helvetica', 'bold'); doc.text('Position in Class:', 120, 70)
  doc.setFont('helvetica', 'normal'); doc.text(`${stats.studentPos} out of ${stats.classSize}`, 155, 70)

  doc.setFont('helvetica', 'bold'); doc.text('Final Average:', 120, 80)
  doc.setFont('helvetica', 'normal'); doc.text(`${stats.average.toFixed(1)}%`, 150, 80)

  // --- ACADEMIC RESULTS TABLE ---
  const tableBody = results.map(r => {
    const total = Number(r.ca_score) + Number(r.exam_score)
    return [
      r.subject, 
      r.ca_score, 
      r.exam_score, 
      total, 
      r.grade || '-', 
      r.remark || '-',
      r.position ? `${r.position}/${r.class_size}` : '-'
    ]
  })

  autoTable(doc, {
    startY: 95,
    head: [['Subject', 'C.A (30)', 'Exam (70)', 'Total (100)', 'Grade', 'Remark', 'Class Pos']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center', fontStyle: 'bold' },
      4: { halign: 'center', fontStyle: 'bold' },
      6: { halign: 'center' }
    }
  })

  // --- COMMENTS & SIGNATURES ---
  const finalY = doc.lastAutoTable.finalY + 15

  // Box for comments
  doc.setDrawColor(200, 200, 200)
  doc.roundedRect(14, finalY, 182, 40, 3, 3)

  const firstResult = results[0] || {}
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold'); doc.text('Form Teacher\'s Remark:', 20, finalY + 10)
  doc.setFont('helvetica', 'italic'); doc.setFontSize(9)
  doc.text(firstResult.teacher_comment || 'Awaiting teacher remark...', 20, finalY + 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold'); doc.text('Principal\'s Remark:', 20, finalY + 28)
  doc.setFont('helvetica', 'italic'); doc.setFontSize(9)
  doc.text(firstResult.principal_comment || 'Awaiting principal remark...', 20, finalY + 36)

  // Signatures
  doc.setLineWidth(0.5)
  doc.setDrawColor(150, 150, 150)
  
  doc.line(20, finalY + 65, 80, finalY + 65)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text('Form Teacher\'s Signature', 30, finalY + 70)

  doc.line(130, finalY + 65, 190, finalY + 65)
  doc.text('Principal\'s Signature / Stamp', 135, finalY + 70)

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text('This document is a certified computer-generated academic record.', 105, 285, { align: 'center' })

  // Save the PDF
  const filename = `${student.full_name.replace(/\s+/g, '_')}_${sessionInfo.term.replace(/\s+/g, '')}_ReportCard.pdf`
  doc.save(filename)
}
