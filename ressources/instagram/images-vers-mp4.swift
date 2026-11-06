// Assemble des images PNG numérotées (00000.png, 00001.png…) en vidéo MP4 H.264, avec les outils intégrés à macOS.
// Usage : swift images-vers-mp4.swift <dossier-images> <sortie.mp4> [images-par-seconde]
import AVFoundation
import AppKit

let args = CommandLine.arguments
let dossier = URL(fileURLWithPath: args[1])
let sortie = URL(fileURLWithPath: args[2])
let ips = Int32(args.count > 3 ? Int(args[3])! : 30)

let fichiers = try FileManager.default.contentsOfDirectory(atPath: dossier.path).filter { $0.hasSuffix(".png") }.sorted()
guard let premiere = NSImage(contentsOf: dossier.appendingPathComponent(fichiers[0])),
      let cg0 = premiere.cgImage(forProposedRect: nil, context: nil, hints: nil) else { fatalError("image illisible") }
let w = cg0.width, h = cg0.height

try? FileManager.default.removeItem(at: sortie)
let writer = try AVAssetWriter(outputURL: sortie, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: w, AVVideoHeightKey: h,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 10_000_000, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel]
])
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB, kCVPixelBufferWidthKey as String: w, kCVPixelBufferHeightKey as String: h
])
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

for (i, nom) in fichiers.enumerated() {
  autoreleasepool {
    let img = NSImage(contentsOf: dossier.appendingPathComponent(nom))!
    let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil)!
    var pb: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
    CVPixelBufferLockBaseAddress(pb!, [])
    let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb!), width: w, height: h, bitsPerComponent: 8,
                        bytesPerRow: CVPixelBufferGetBytesPerRow(pb!), space: CGColorSpaceCreateDeviceRGB(),
                        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
    ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
    CVPixelBufferUnlockBaseAddress(pb!, [])
    while !input.isReadyForMoreMediaData { usleep(2000) }
    adaptor.append(pb!, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: ips))
  }
}
input.markAsFinished()
let fini = DispatchSemaphore(value: 0)
writer.finishWriting { fini.signal() }
fini.wait()
if writer.status != .completed { fatalError("échec : \(String(describing: writer.error))") }
print("Vidéo écrite : \(sortie.path) (\(fichiers.count) images, \(w)×\(h))")
